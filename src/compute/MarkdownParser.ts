import HistoricaPlugin from "@/main";
import {TFile} from "obsidian";

import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {Node, Parent} from "unist"
import {Processor, unified} from "unified";
import {HistoricaSettings, NodeAndTFile, TimelineEntry, SentenceWithOffset} from "@/src/types";
import {deterministicEntryId} from "@/src/utils";
import {Chrono, ParsedResult} from "@nhannht/chrono-node";

type SentenceParse = { sentence: string; results: ParsedResult[]; hadForwardAnchor: boolean }

const yieldThread = () => new Promise<void>(r => setTimeout(r, 0))

function stripMarkdownLinks(text: string): string {
	return text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
}

const DURATION_PATTERN = /^(?:just\s+)?(?:\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|several|few|many)\s+(?:second|minute|hour|day|week|month|year|decade|centur|millennium)s?\b/i

function isDurationExpression(text: string, resolvedDate: Date): boolean {
	if (!DURATION_PATTERN.test(text.trim())) return false
	// If the resolved date is near the current year, the anchor didn't work — filter it out
	const now = new Date()
	return Math.abs(resolvedDate.getFullYear() - now.getFullYear()) <= 2
}

export default class MarkdownProcessor {
	RemarkProcessor: Processor;
	private sentenceSegmenter = new Intl.Segmenter('en', {granularity: 'sentence'})

	constructor(
		public plugin: HistoricaPlugin,
		private settings: HistoricaSettings
	) {
		this.RemarkProcessor = unified().use(remarkGfm).use(remarkParse) as unknown as Processor
	}

	private sentencesTokenize(text: string): string[] {
		return Array.from(this.sentenceSegmenter.segment(text), s => s.segment.trim()).filter(s => s.length > 0)
	}

	async getPlotUnits(sentences: SentenceWithOffset[]): Promise<TimelineEntry[]> {
		const units: TimelineEntry[] = []
		const occurrenceCount = new Map<string, number>()

		for (const s of sentences) {
			const validResults = s.parsedResults.filter(r => !isDurationExpression(r.text, r.date()))
			const best = validResults[0]
			if (!best) continue

			// Track occurrence index per sentence text for deterministic IDs
			const idx = occurrenceCount.get(s.text) ?? 0
			occurrenceCount.set(s.text, idx + 1)

			const yearCertain = best.start.isCertain("year");
			const monthCertain = best.start.isCertain("month");
			const dayCertain = best.start.isCertain("day");
			const precision: "full" | "partial" | "approximate" =
				yearCertain && monthCertain && dayCertain ? "full"
				: yearCertain ? "partial"
				: "approximate";

			units.push({
				nodePos: s.node.node.position ? s.node.node.position : {
					start: {line: 1, column: 1, offset: 0},
					end: {line: 1, column: 1, offset: 0}
				},
				filePath: s.node.file.path,
				fileParent: s.node.file.parent ? s.node.file.parent.path : "",
				parsedResultText: best.text,
				sentence: s.text,
				time: {
					value: best.date().getTime().toString(),
					style: "unix"
				},
				id: deterministicEntryId(s.text, idx),
				attachments: [],
				isExpanded: false,
				precision,
			})
		}
		return units
	}

	async getAllSentencesRaw(file: TFile, nodes: NodeAndTFile[]): Promise<string[]> {
		const fileText = await this.plugin.app.vault.cachedRead(file)
		const all: string[] = []
		for (const n of nodes) {
			if (n.file.path !== file.path) continue
			const paragraphText = fileText.slice(n.node.position?.start.offset, n.node.position?.end.offset)
			const cleanText = stripMarkdownLinks(paragraphText)
			all.push(...this.sentencesTokenize(cleanText))
		}
		return all
	}

	async extractValidSentencesFromFile(file: TFile, nodes: NodeAndTFile[]) {
		const fileText = await this.plugin.app.vault.cachedRead(file)
		const lang = this.settings.language ?? this.plugin.pluginSettings.language ?? "auto";
		const customChrono = this.plugin.historicaChrono.getParserForLanguage(fileText, lang)
		const sentencesWithOffsets: SentenceWithOffset[] = []

		for (let ni = 0; ni < nodes.length; ni++) {
			const n = nodes[ni]
			if (n.file.path !== file.path) continue
			if (ni % 5 === 0) await yieldThread()

			const paragraphText = fileText.slice(n.node.position?.start.offset, n.node.position?.end.offset)
			const cleanText = stripMarkdownLinks(paragraphText)
			const sentences = this.sentencesTokenize(cleanText)

			const parsed: SentenceParse[] = []

			// Initial parse (no context)
			for (const sentence of sentences) {
				try {
					const results: ParsedResult[] = customChrono.parse(sentence)
					parsed.push({sentence, results, hadForwardAnchor: false})
				} catch {
					parsed.push({sentence, results: [], hadForwardAnchor: false})
				}
			}

			const MAX_ITERATIONS = 5
			for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
				let changed = false

				// Forward pass: propagate anchors left-to-right
				let anchor: Date | undefined = undefined
				for (const p of parsed) {
					p.hadForwardAnchor = false
					if (anchor) {
						p.hadForwardAnchor = true
						const reparsed = this.reparseWithAnchor(customChrono, p.sentence, anchor)
						if (reparsed && this.resultsChanged(p.results, reparsed)) {
							p.results = reparsed
							changed = true
						}
					}
					for (const r of p.results) {
						if (r.start.isCertain("year")) anchor = r.start.date()
					}
				}

				// Backward pass: only fill gaps (sentences the forward pass couldn't reach)
				anchor = undefined
				for (let i = parsed.length - 1; i >= 0; i--) {
					const p = parsed[i]
					if (anchor && !p.hadForwardAnchor) {
						const reparsed = this.reparseWithAnchor(customChrono, p.sentence, anchor)
						if (reparsed && this.resultsChanged(p.results, reparsed)) {
							p.results = reparsed
							changed = true
						}
					}
					for (const r of p.results) {
						if (r.start.isCertain("year")) anchor = r.start.date()
					}
				}

				if (!changed) break
			}

			for (const p of parsed) {
				if (p.results.length !== 0) {
					sentencesWithOffsets.push({
						node: n,
						text: p.sentence,
						parsedResults: p.results
					})
				}
			}
		}

		return sentencesWithOffsets
	}

	private reparseWithAnchor(customChrono: Chrono, sentence: string, anchor: Date): ParsedResult[] | null {
		try {
			const anchorYear = anchor.getFullYear()
			const anchorYearStart = new Date(anchorYear < 0 ? 0 : anchorYear, 0, 1)
			if (anchorYear < 0) anchorYearStart.setFullYear(anchorYear)
			const opts = anchorYear < 0 ? {} : {forwardDate: true}
			const results = customChrono.parse(sentence, anchorYearStart, opts)
			return results.length > 0 ? results : null
		} catch {
			return null
		}
	}

	private resultsChanged(prev: ParsedResult[], next: ParsedResult[]): boolean {
		if (prev.length !== next.length) return true
		for (let i = 0; i < prev.length; i++) {
			const a = prev[i].start, b = next[i].start
			if (a.get("year") !== b.get("year")
				|| a.get("month") !== b.get("month")
				|| a.get("day") !== b.get("day")) return true
		}
		return false
	}

	private async recursiveGetNodeDataFromSingleFile(node: Node, file: TFile, nodes: NodeAndTFile[]) {
		if (node.type == "paragraph") {
			nodes.push({node, file})
		}
		if ("children" in node) {
			(node as Parent).children.forEach((childNode: Node) => {
				this.recursiveGetNodeDataFromSingleFile(childNode, file, nodes)
			})
		}
	}

	async parseFilesAndGetNodeData(file: TFile) {
		const nodes: NodeAndTFile[] = []
		const fileContent = await this.plugin.app.vault.cachedRead(file)
		const parseTree: Node = this.RemarkProcessor.parse(fileContent)
		await this.recursiveGetNodeDataFromSingleFile(parseTree, file, nodes)
		return nodes
	}


	/**
	 * Like parseFilesAndGetNodeData, but scoped to the heading section containing
	 * the historica block with the given blockId.
	 *
	 * Algorithm:
	 *   1. Parse the file AST (flat list of block-level nodes under root)
	 *   2. Find the `code` node whose value includes blockId
	 *   3. Walk backwards to find the nearest heading → determines sectionDepth
	 *   4. Walk forward to find the next heading at same or higher level → section end
	 *   5. Collect all paragraph nodes within that range (via recursiveGetNodeDataFromSingleFile)
	 *
	 * Falls back to full-file parse when:
	 *   - blockId not found in the file (shouldn't happen, but safe)
	 *   - No heading exists above the block (block is at document root)
	 */
	async parseFilesAndGetNodeDataForSection(file: TFile, blockId: string): Promise<NodeAndTFile[]> {
		const nodes: NodeAndTFile[] = []
		const fileContent = await this.plugin.app.vault.cachedRead(file)
		const parseTree = this.RemarkProcessor.parse(fileContent) as Parent
		const children = parseTree.children as Node[]

		// Find the fenced code block node whose value contains blockId
		let blockIdx = -1
		for (let i = 0; i < children.length; i++) {
			const child = children[i] as any
			if (child.type === 'code' && typeof child.value === 'string' && child.value.includes(blockId)) {
				blockIdx = i
				break
			}
		}

		// blockId not found → full-file fallback
		if (blockIdx === -1) return this.parseFilesAndGetNodeData(file)

		// Walk backwards from blockIdx to find the nearest heading
		let sectionStartIdx = -1
		let sectionDepth = 0
		for (let i = blockIdx - 1; i >= 0; i--) {
			const child = children[i] as any
			if (child.type === 'heading') {
				sectionStartIdx = i
				sectionDepth = child.depth as number
				break
			}
		}

		// No heading above the block → block is at document root → full-file fallback
		if (sectionStartIdx === -1) return this.parseFilesAndGetNodeData(file)

		// Walk forward from sectionStartIdx to find the boundary: next heading at same or higher level
		let sectionEndIdx = children.length
		for (let i = sectionStartIdx + 1; i < children.length; i++) {
			const child = children[i] as any
			if (child.type === 'heading' && (child.depth as number) <= sectionDepth) {
				sectionEndIdx = i
				break
			}
		}

		// Collect all paragraph nodes within [sectionStartIdx+1, sectionEndIdx)
		for (let i = sectionStartIdx + 1; i < sectionEndIdx; i++) {
			await this.recursiveGetNodeDataFromSingleFile(children[i], file, nodes)
		}

		return nodes
	}
}
