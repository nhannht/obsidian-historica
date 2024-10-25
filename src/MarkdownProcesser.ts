import HistoricaPlugin from "@/main";
import {moment, TFile} from "obsidian";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {Node} from "unist"
import {Processor, unified} from "unified";
import {GenerateBlockId, HistoricaSettingNg, NodeAndTFile, PlotUnitNg, SentenceWithOffset} from "@/src/global";
import {SentenceTokenizer} from "natural/lib/natural/tokenizers"
import {ParsedResult} from "chrono-node";


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
		let u: PlotUnitNg[] = []
		sens.map(s => {
			// const par = await ExtractParagraph(s,this.currentPlugin)
			// console.log(par)
			s.parsedResults.map(r => {
				u.push({
					nodePos: s.node.node.position ? s.node.node.position : {
						start: {
							line: 1,
							column: 1,
							offset: 0
						},
						end: {
							line: 1,
							column: 1,
							offset: 0

						}
					},
					filePath: s.node.file.path,
					fileParent: s.node.file.parent ? s.node.file.parent.path : "this path is not exist",
					parsedResultText: r.text,
					sentence: s.text,
					time: {
						value: r.date().getTime().toString(),
						style: "unix"

					},
					id: GenerateBlockId(),
					attachments: [],
					isExpanded:true
				})
			})
		})

		return u

	}


	async ExtractValidSentencesFromFile(file: TFile, nodes: NodeAndTFile[],lang:string,pin_time?:number) {
		// console.log("trigger 1")
		const customChrono = await this.currentPlugin.historicaChrono.setupCustomChrono(lang)
		// console.log(customChrono)
		const sentencesWithOffsets: SentenceWithOffset[] = []
		// console.log(this.nodes)
		// console.log(this.nodes.length)
		const fileText = await this.currentPlugin.app.vault.read(file)
		nodes.map(n => {
			if (n.file.path === file.path) {
				// console.log("trigger 2")

				const paragraphText = fileText.slice(n.node.position?.start.offset, n.node.position?.end.offset)
				const sentences = this.sentencesTokenize(paragraphText)


				for (const sentence of sentences) {
					var parsedResult: ParsedResult[];
					// what if user add pin time
					if (pin_time) {
						parsedResult = customChrono.parse(sentence, moment.unix(this.settings.pin_time).toDate())

					} else {
						parsedResult = customChrono.parse(sentence)

					}


					// // solve the fucking stupid query
					// let filterR: ParsedResult[] = []
					// if (this.settings.query && this.settings.query.length !== 0) {
					// 	// console.log("trigger 3")
					// 	// const queryKeys = Object.keys(this.settings.query)
					// 	this.settings.query.map(query => {
					// 		// console.log("trigger 4")
					//
					//
					// 		if (query.start && query.start.trim() !== "") {
					// 			const start = customChrono.parse(query.start)
					// 			// console.log(start)
					// 			parsedResult.map((r) => {
					// 				if (r.start && r.start.date().getTime() < start[0].start.date().getTime()) {
					// 					filterR.push(r)
					//
					// 				}
					// 			})
					// 		}
					// 		if (query.end && query.end.trim() !== "") {
					// 			const end = customChrono.parse(query.end)
					// 			const endTime = end[0].start.date().getTime()
					// 			// console.log(end)
					// 			parsedResult.map((r) => {
					// 				if (r.end && r.end.date().getTime() > endTime) {
					// 					filterR.push(r)
					// 					// why this, because for fucking stupid reasons the end maybe return null
					// 				}
					//
					// 				if (r.end === null && r.start.date().getTime() > endTime) {
					// 					filterR.push(r)
					//
					//
					//
					// 				}
					// 			})
					// 		}
					// 	})
					//
					//
					// }
					//
					// let temp: ParsedResult[] = []
					// parsedResult.map(r=>{
					// 	const filterRContainShit = filterR.some(fr=>fr.text === r.text)
					// 	if (!filterRContainShit){
					// 		temp.push(r)
					// 	}
					// })
					// parsedResult = temp


					// if this sentence didn't have parsed result ignore it, god, I lost, this things is the one of the most stupid thing I have ever created
					if (parsedResult.length !== 0) {
						sentencesWithOffsets.push({
							node: n,
							text: sentence,
							parsedResults: parsedResult

						})
					}
				}

			}
		})
		// console.log(sentencesWithOffsets)

		return sentencesWithOffsets;

	}


	 private async recursiveGetNodeDataFromSingleFile(node: Node, file: TFile, nodes: NodeAndTFile[]) {

		if (node.type == "paragraph") {
			nodes.push({
				node,
				file
			})
		}
		if ("children" in node) {
			//@ts-ignore
			node.children.forEach((childNode: Node) => {
				this.recursiveGetNodeDataFromSingleFile(childNode, file, nodes)
			})
		}
	}



	 async ParseFilesAndGetNodeData(file: TFile) {
		let nodes: NodeAndTFile[] = []
		const fileContent = await this.currentPlugin.app.vault.cachedRead(file)
		const parseTree: Node = this.RemarkProcessor.parse(fileContent)
		// console.log(parseTree)
		await this.recursiveGetNodeDataFromSingleFile(parseTree, file, nodes)
		if (nodes){
			return nodes
		} else return []

	}


}
