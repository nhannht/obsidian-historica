import HistoricaPlugin from "@/main";
import {TFile} from "obsidian";
import {moment} from "../moment-fix";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {Node} from "unist"
import {Processor, unified} from "unified";
import {HistoricaSettingNg, NodeAndTFile, PlotUnitNg, SentenceWithOffset} from "@/src/types";
import {GenerateRandomId} from "@/src/utils";
import {Chrono, ParsedResult} from "chrono-node";

type SentenceParse = { sentence: string; results: ParsedResult[]; hadForwardAnchor: boolean }

function stripMarkdownLinks(text: string): string {
	return text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
}

export default class MarkdownProcesser {
	RemarkProcessor: Processor;
	private sentenceSegmenter = new Intl.Segmenter('en', {granularity: 'sentence'})

	constructor(
		public currentPlugin: HistoricaPlugin,
		_settings: HistoricaSettingNg
	) {
		//@ts-ignore
		this.RemarkProcessor = unified().use(remarkGfm).use(remarkParse)
	}

	private sentencesTokenize(text: string): string[] {
		return Array.from(this.sentenceSegmenter.segment(text), s => s.segment.trim()).filter(s => s.length > 0)
	}

	async GetPlotUnits(sens: SentenceWithOffset[]): Promise<PlotUnitNg[]> {
		const units: PlotUnitNg[] = []
		for (const s of sens) {
			for (const r of s.parsedResults) {
				units.push({
					nodePos: s.node.node.position ? s.node.node.position : {
						start: {line: 1, column: 1, offset: 0},
						end: {line: 1, column: 1, offset: 0}
					},
					filePath: s.node.file.path,
					fileParent: s.node.file.parent ? s.node.file.parent.path : "",
					parsedResultText: r.text,
					sentence: s.text,
					time: {
						value: r.date().getTime().toString(),
						style: "unix"
					},
					id: GenerateRandomId(),
					attachments: [],
					isExpanded: true
				})
			}
		}
		return units
	}

	async ExtractValidSentencesFromFile(file: TFile, nodes: NodeAndTFile[], pin_time?: number) {
		const customChrono = await this.currentPlugin.historicaChrono.setupCustomChrono()
		const sentencesWithOffsets: SentenceWithOffset[] = []
		const fileText = await this.currentPlugin.app.vault.read(file)

		const refDate = pin_time ? moment.unix(pin_time).toDate() : undefined

		for (const n of nodes) {
			if (n.file.path !== file.path) continue

			const paragraphText = fileText.slice(n.node.position?.start.offset, n.node.position?.end.offset)
			const cleanText = stripMarkdownLinks(paragraphText)
			const sentences = this.sentencesTokenize(cleanText)

			const parsed: SentenceParse[] = []

			// Initial parse (no context)
			for (const sentence of sentences) {
				try {
					const results: ParsedResult[] = refDate
						? customChrono.parse(sentence, refDate)
						: customChrono.parse(sentence)
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
			//@ts-ignore
			node.children.forEach((childNode: Node) => {
				this.recursiveGetNodeDataFromSingleFile(childNode, file, nodes)
			})
		}
	}

	async ParseFilesAndGetNodeData(file: TFile) {
		const nodes: NodeAndTFile[] = []
		const fileContent = await this.currentPlugin.app.vault.cachedRead(file)
		const parseTree: Node = this.RemarkProcessor.parse(fileContent)
		await this.recursiveGetNodeDataFromSingleFile(parseTree, file, nodes)
		return nodes
	}
}
