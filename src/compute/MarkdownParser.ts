import HistoricaPlugin from "@/main";
import {TFile} from "obsidian";
import {moment} from "../moment-fix";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {Node} from "unist"
import {Processor, unified} from "unified";
import {HistoricaSettingNg, NodeAndTFile, PlotUnitNg, SentenceWithOffset} from "@/src/types";
import {GenerateRandomId} from "@/src/utils";
import {ParsedResult} from "chrono-node";

function stripMarkdownLinks(text: string): string {
	return text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
}

export default class MarkdownProcesser {
	RemarkProcessor: Processor;
	private sentenceSegmenter = new Intl.Segmenter('en', {granularity: 'sentence'})

	constructor(
		public currentPlugin: HistoricaPlugin,
		private settings: HistoricaSettingNg
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

		// Two-pass parsing: first collect anchor dates, then use them as referenceDate
		// for sentences that lack explicit years
		const refDate = pin_time ? moment.unix(this.settings.pin_time).toDate() : undefined

		for (const n of nodes) {
			if (n.file.path !== file.path) continue

			const paragraphText = fileText.slice(n.node.position?.start.offset, n.node.position?.end.offset)
			const cleanText = stripMarkdownLinks(paragraphText)
			const sentences = this.sentencesTokenize(cleanText)

			// Pass 1: parse all sentences, collect anchor dates (results with explicit years)
			type SentenceParse = { sentence: string; results: ParsedResult[] }
			const parsed: SentenceParse[] = []
			const anchors: Date[] = []

			for (const sentence of sentences) {
				try {
					const results: ParsedResult[] = refDate
						? customChrono.parse(sentence, refDate)
						: customChrono.parse(sentence)
					parsed.push({sentence, results})
					// Collect dates from results that have an explicit year as anchors
					for (const r of results) {
						if (r.start.isCertain("year")) {
							anchors.push(r.start.date())
						}
					}
				} catch {
					parsed.push({sentence, results: []})
				}
			}

			// Pass 2: re-parse sentences with no results using the nearest prior anchor
			let lastAnchor: Date | undefined = undefined
			for (const p of parsed) {
				// Update the rolling anchor from Pass 1 results
				for (const r of p.results) {
					if (r.start.isCertain("year")) {
						lastAnchor = r.start.date()
					}
				}

				let finalResults = p.results
				// If no results and we have an anchor, retry with referenceDate
				// Use Jan 1 of the anchor year + forwardDate to avoid month ambiguity
				if (finalResults.length === 0 && lastAnchor) {
					try {
						const anchorYear = lastAnchor.getFullYear()
						const anchorYearStart = new Date(anchorYear < 0 ? 0 : anchorYear, 0, 1)
						if (anchorYear < 0) anchorYearStart.setFullYear(anchorYear)
						// forwardDate only for AD — chrono's forward-date refiner pushes toward present, wrong for BC
						const opts = anchorYear < 0 ? {} : {forwardDate: true}
						finalResults = customChrono.parse(p.sentence, anchorYearStart, opts)
					} catch {
						// Keep empty results
					}
				}

				if (finalResults.length !== 0) {
					sentencesWithOffsets.push({
						node: n,
						text: p.sentence,
						parsedResults: finalResults
					})
				}
			}
		}

		return sentencesWithOffsets
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
