import HistoricaPlugin from "@/main";
import {TFile} from "obsidian";

import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {Node, Parent} from "unist"
import {Processor, unified} from "unified";
import {HistoricaSettings, NodeAndTFile, TimelineEntry, SentenceWithOffset} from "@/src/types";
import {generateRandomId} from "@/src/utils";
import {Chrono, ParsedResult} from "chrono-node";

type SentenceParse = { sentence: string; results: ParsedResult[]; hadForwardAnchor: boolean }

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
		_settings: HistoricaSettings
	) {
		this.RemarkProcessor = unified().use(remarkGfm).use(remarkParse) as unknown as Processor
	}

	private sentencesTokenize(text: string): string[] {
		return Array.from(this.sentenceSegmenter.segment(text), s => s.segment.trim()).filter(s => s.length > 0)
	}

	async getPlotUnits(sentences: SentenceWithOffset[]): Promise<TimelineEntry[]> {
		const units: TimelineEntry[] = []
		const seenSentences = new Set<string>()

		for (const s of sentences) {
			// Dedup: one entry per sentence (use the first/earliest date match)
			if (seenSentences.has(s.text)) continue
			seenSentences.add(s.text)

			// Pick the best result: prefer the one with the most specific date
			const validResults = s.parsedResults.filter(r => !isDurationExpression(r.text, r.date()))
			const best = validResults[0]
			if (!best) continue

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
				id: generateRandomId(),
				attachments: [],
				isExpanded: false
			})
		}
		return units
	}

	async extractValidSentencesFromFile(file: TFile, nodes: NodeAndTFile[]) {
		const customChrono = await this.plugin.historicaChrono.setupCustomChrono()
		const sentencesWithOffsets: SentenceWithOffset[] = []
		const fileText = await this.plugin.app.vault.cachedRead(file)

		for (const n of nodes) {
			if (n.file.path !== file.path) continue

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
}
