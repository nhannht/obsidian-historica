import HistoricaPlugin from "@/main";
import {TFile} from "obsidian";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import {Node} from "unist"
import {Processor, unified} from "unified";
import {HistoricaSettingNg, NodeFromParseTree} from "@/src/global";
import {SentenceTokenizer} from "natural/lib/natural/tokenizers"
import {Chrono, ParsedResult} from "chrono-node";

export interface SentenceWithOffset {
	node:NodeFromParseTree;
	text: string;
	parsedResult: ParsedResult[]

}




export default class MarkdownProcesser {

	get nodes(): NodeFromParseTree[] {
		return this._nodes;
	}

	private _remarkProcessor: Processor;

	get currentPlugin(): HistoricaPlugin {
		return this._currentPlugin;
	}



	private _files: TFile[];
	private _currentPlugin: HistoricaPlugin;

	private _nodes: NodeFromParseTree[] = [];

	private data: any = [];

	private  sentenceTokenizer = new SentenceTokenizer(['i.e','e.g'])

	constructor(files: TFile[],
				currentPlugin: HistoricaPlugin
	) {
		this._files = files;
		this._currentPlugin = currentPlugin;
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

	async ExtractSentenceDataFromEachNode(fileText:string){
		const customChrono = await this.currentPlugin.historicaChrono.setupCustomChrono("en")
		const sentencesWithOffsets: SentenceWithOffset[] = []
		this.nodes.map(n=>{
			const paragraphText = fileText.slice(n.node.position?.start.offset,n.node.position?.end.offset)
			const sentences = this.sentencesTokenize(paragraphText)

			for (const sentence of sentences) {
				const parsedResult = customChrono.parse(sentence)

				sentencesWithOffsets.push({
					node: n,
                    text: sentence,
					parsedResult:parsedResult

                })

			}
		})

		return sentencesWithOffsets;

	}



	private async recursiveGetListItemFromParseTree(node: Node
		, file: TFile
		, settings: HistoricaSettingNg) {

		if (node.type == "paragraph") {
			this.nodes.push({
				node,
				file
			})
		}
		if ("children" in node) {
			//@ts-ignore
			node.children.forEach((childNode: Node) => {
				this.recursiveGetListItemFromParseTree(childNode, file, settings)
			})
		}
	}

	private async parseFilesAndUpdateTokensNg(file: TFile, settings: HistoricaSettingNg) {
		if (!file) return
		const fileContent = await this.currentPlugin.app.vault.cachedRead(file)
		const parseTree: Node = this._remarkProcessor.parse(fileContent)
		// console.log(parseTree)
		await this.recursiveGetListItemFromParseTree(parseTree, file, settings)

	}


	async parseAllFilesNg(settings: HistoricaSettingNg) {
		const pathFilterSettings = settings.path_list
		// by default we will pass all files in the vault to this class _files - because the number of file path, even thousands, still relatve small to compute, and will filter only needed file.
		this._files.map(async (file) => {
			// console.log(file)
			if (pathFilterSettings.indexOf("AllFiles") !== -1) {
			} else if (pathFilterSettings.indexOf("CurrentFile") !== -1) {
				if (this._currentPlugin.app.workspace.getActiveFile()?.name !== file.name) return
			} else if (
				(pathFilterSettings.indexOf("AllFiles") === -1) &&
				(pathFilterSettings.indexOf("CurrentFile") === -1) &&
				(pathFilterSettings.indexOf(file.parent?.path!) === -1)
			) return
			// console.log(file)
			await this.parseFilesAndUpdateTokensNg(file, settings)
		})
	}





}
