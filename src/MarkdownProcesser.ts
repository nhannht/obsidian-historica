import HistoricaPlugin from "@/main";
import {TFile} from "obsidian";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {Node} from "unist"
import {Processor, unified} from "unified";
import {GenerateBlockId, HistoricaSettingNg, NodeAndTFile, PlotUnitNg, SentenceWithOffset} from "@/src/global";
import {SentenceTokenizer} from "natural/lib/natural/tokenizers"
import {ParsedResult} from "chrono-node";


export default class MarkdownProcesser {

	get nodes(): NodeAndTFile[] {
		return this._nodes;
	}

	private _remarkProcessor: Processor;

	private _nodes: NodeAndTFile[] = [];


	private sentenceTokenizer = new SentenceTokenizer(['i.e', 'e.g'])

	constructor(
		public currentPlugin: HistoricaPlugin,
		private settings: HistoricaSettingNg
	) {

		//@ts-ignore
		this._remarkProcessor = unified().use(remarkGfm).use(remarkParse)

	}

	async extractTextEachNode(text: string) {
		this.nodes.map(n => {

			console.log(text.slice(n.node.position?.start.offset, n.node.position?.end.offset))
		})
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
					parsedResultUnixTime: r.date().getTime(),
					id: GenerateBlockId(),
					attachments: []
				})
			})
		})

		if (this.settings.sort === "asc") {
			u.sort((u1, u2) => {
				return u1.parsedResultUnixTime - u2.parsedResultUnixTime
			})
		} else if (this.settings.sort === "desc") {
			u.sort((u1, u2) => {
				return u2.parsedResultUnixTime - u1.parsedResultUnixTime
			})
		}

		return u

	}


	async ExtractValidSentences(file: TFile) {
		// console.log("trigger 1")
		const customChrono = await this.currentPlugin.historicaChrono.setupCustomChrono(this.settings.language)
		// console.log(customChrono)
		const sentencesWithOffsets: SentenceWithOffset[] = []
		// console.log(this.nodes)
		// console.log(this.nodes.length)
		const fileText = await this.currentPlugin.app.vault.read(file)
		this.nodes.map(n => {
			if (n.file.path === file.path){
				// console.log("trigger 2")

				const paragraphText = fileText.slice(n.node.position?.start.offset, n.node.position?.end.offset)
				const sentences = this.sentencesTokenize(paragraphText)


				for (const sentence of sentences) {
					var parsedResult: ParsedResult[];
					// what if user add pin time
					if (this.settings.pin_time && this.settings.pin_time.trim().toLowerCase() !== "now") {
						const referencedTime = customChrono.parse(this.settings.pin_time.trim())
						parsedResult = customChrono.parse(sentence, referencedTime[0].start.date())

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


	private async recursiveGetListItemFromParseTree(node: Node, file: TFile) {

		if (node.type == "paragraph") {
			this.nodes.push({
				node,
				file
			})
		}
		if ("children" in node) {
			//@ts-ignore
			node.children.forEach((childNode: Node) => {
				this.recursiveGetListItemFromParseTree(childNode, file)
			})
		}
	}


	// from this function we parse the input file and get the node, the suitable node must be type paragraph, and inside this function the
	// this.nodes will be created
	private async parseFilesAndUpdateTokensNg(file: TFile) {
		if (!file) return
		const fileContent = await this.currentPlugin.app.vault.cachedRead(file)
		const parseTree: Node = this._remarkProcessor.parse(fileContent)
		// console.log(parseTree)
		await this.recursiveGetListItemFromParseTree(parseTree, file)

	}

	// this is where we filter valid file base on block or global setting
	async parseAllFilesNg() {
		const allMarkdownFiles = this.currentPlugin.app.vault.getMarkdownFiles()
		let filteredFiles: TFile[] = []
		const currentFile = this.currentPlugin.app.workspace.getActiveFile()
		if (currentFile instanceof TFile) {
			filteredFiles.push(currentFile)
		}
		const includeFiles = this.settings.include_files ? this.settings.include_files : []
		includeFiles.map(f => {
			allMarkdownFiles.map(_f => {
				if (_f.path.trim() === f) filteredFiles.push(_f)
			})
		})
		// console.log(filteredFiles)
		filteredFiles.map(f => {
			this.parseFilesAndUpdateTokensNg(f)
		})

	}


}
