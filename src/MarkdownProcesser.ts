import HistoricaPlugin from "@/main";
import {TFile} from "obsidian";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {Node} from "unist"
import {Processor, unified} from "unified";
import {HistoricaSettingNg, NodeFromParseTree, SentenceWithOffset} from "@/src/global";
import {SentenceTokenizer} from "natural/lib/natural/tokenizers"
import {ParsedResult} from "chrono-node";


export default class MarkdownProcesser {

	get nodes(): NodeFromParseTree[] {
		return this._nodes;
	}

	private _remarkProcessor: Processor;

	private _nodes: NodeFromParseTree[] = [];


	private  sentenceTokenizer = new SentenceTokenizer(['i.e','e.g'])

	constructor(
				public currentPlugin: HistoricaPlugin,
				private settings :HistoricaSettingNg
	) {

		//@ts-ignore
		this._remarkProcessor = unified().use(remarkGfm).use(remarkParse)

	}

	async extractTextEachNode(text:string){
		this.nodes.map(n =>{

			console.log(text.slice(n.node.position?.start.offset,n.node.position?.end.offset))
		})
	}

	private sentencesTokenize(text:string){

		return this.sentenceTokenizer.tokenize(text)
	}


	async ExtractValidSentences(fileText:string){
		const customChrono = await this.currentPlugin.historicaChrono.setupCustomChrono(this.settings.language)
		const sentencesWithOffsets: SentenceWithOffset[] = []
		this.nodes.map(n=>{
			const paragraphText = fileText.slice(n.node.position?.start.offset,n.node.position?.end.offset)
			const sentences = this.sentencesTokenize(paragraphText)

			for (const sentence of sentences) {
				var parsedResult:ParsedResult[];
				// what if user add pin time
				if (this.settings.pin_time){
					const referencedTime = customChrono.parse(this.settings.pin_time.trim())
					parsedResult = customChrono.parse(sentence,referencedTime[0].start.date())

				} else {
					parsedResult = customChrono.parse(sentence)

				}

				// solve the fucking stupid query
				if (this.settings.query){
					let filterR:ParsedResult[] = []
					this.settings.query.map(q =>{
						if (q.start){
							const start = customChrono.parse(q.start)
							parsedResult.map(r =>{
								if (r.start && r.start.date() >= start[0].start.date()) filterR.push(r)
							})
						}
						if (q.end){
							const end = customChrono.parse(q.end)
							parsedResult.map(r=>{
								if (r.end && r.end.date() <= end[0].start.date()) filterR.push(r)
							})
						}
					})
					parsedResult = filterR
				}
				// if this sentence didn't have parsed result ignore it, god, I lost, this things is the one of the most stupid thing I have ever created
				if (parsedResult.length != 0 ){
					sentencesWithOffsets.push({
						node: n,
						text: sentence,
						parsedResult:parsedResult

					})
				}
			}
		})

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
		const pathFilterSettings = this.settings.path_list
		const allMarkdownFiles = this.currentPlugin.app.vault.getMarkdownFiles()
		let filteredFiles:TFile[] = []
		if (pathFilterSettings === "All"){
			filteredFiles = structuredClone(allMarkdownFiles)
		} else if (pathFilterSettings === "Current"){
			const currentFile = this.currentPlugin.app.workspace.getActiveFile()
			if (currentFile instanceof TFile) {
				filteredFiles.push(currentFile)
			}
		} else if (Array.isArray(pathFilterSettings)) {
			allMarkdownFiles.map(async (file)=>{
				if (pathFilterSettings.indexOf(<String>file.parent?.path) !== -1) {
					filteredFiles.push(file)
				} else return
			})
		}

		this.settings.include_files.map(f =>{
			allMarkdownFiles.map(_f =>{
				if (_f.path.trim() === f) filteredFiles.push(_f)
			})
		})

		filteredFiles.map(f=>{
			this.parseFilesAndUpdateTokensNg(f)
		})

	}





}
