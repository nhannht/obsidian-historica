import HistoricaPlugin from "@/main";
import {TFile} from "obsidian";
import {moment} from "../moment-fix";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {Node} from "unist"
import {Processor, unified} from "unified";
import {HistoricaSettingNg, NodeAndTFile, PlotUnitNg, SentenceWithOffset} from "@/src/types";
import {GenerateRandomId} from "@/src/utils";
import {SentenceTokenizer} from "natural/lib/natural/tokenizers"
import {ParsedResult} from "chrono-node";

function stripMarkdownLinks(text: string): string {
	return text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
}

export default class MarkdownProcesser {
	RemarkProcessor: Processor;
	private sentenceTokenizer = new SentenceTokenizer(['i.e', 'e.g'])

	constructor(
		public currentPlugin: HistoricaPlugin,
		private settings: HistoricaSettingNg
	) {
		//@ts-ignore
		this.RemarkProcessor = unified().use(remarkGfm).use(remarkParse)
	}

	private sentencesTokenize(text: string) {
		return this.sentenceTokenizer.tokenize(text)
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

		for (const n of nodes) {
			if (n.file.path !== file.path) continue

			const paragraphText = fileText.slice(n.node.position?.start.offset, n.node.position?.end.offset)
			const cleanText = stripMarkdownLinks(paragraphText)
			const sentences = this.sentencesTokenize(cleanText)

			for (const sentence of sentences) {
				try {
					const parsedResult: ParsedResult[] = pin_time
						? customChrono.parse(sentence, moment.unix(this.settings.pin_time).toDate())
						: customChrono.parse(sentence)

					if (parsedResult.length !== 0) {
						sentencesWithOffsets.push({
							node: n,
							text: sentence,
							parsedResults: parsedResult
						})
					}
				} catch {
					// Skip sentences that fail to parse
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
