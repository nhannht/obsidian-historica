import {TFile} from "obsidian";
import {marked, Token} from "marked";
import HistoricaPlugin from "../../main";
import HistoricaDocumentProcesser from "./HistoricaDocumentProcesser";

export default class HistoricaDocumentFileParser {
	get documentProcesser(): HistoricaDocumentProcesser {
		return this._documentProcesser;
	}

	set documentProcesser(value: HistoricaDocumentProcesser) {
		this._documentProcesser = value;
	}
	get plugin(): HistoricaPlugin {
		return this._plugin;
	}

	set plugin(value: HistoricaPlugin) {
		this._plugin = value;
	}
	private _plugin: HistoricaPlugin;
	private _documentProcesser: HistoricaDocumentProcesser;

	constructor(plugin:HistoricaPlugin, documentProcesser:HistoricaDocumentProcesser) {
		this._plugin = plugin;
		this._documentProcesser = documentProcesser;

	}


	async parseTFileAndUpdateDocuments(file: TFile | null, documents: Token[]) {
		if (!file) {
			return
		}


		const fileContent = await this.plugin.app.vault.read(file)
		// console.log(1)
		// console.log(fileContent)

		// function filterHTMLAndEmphasis(text: string) {
		// 	const stripHTML = text.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, ""),
		// 		stripEm1 = stripHTML.replace(/\*{1,3}(.*?)\*{1,3}/g, "$1"),
		// 		stripEm2 = stripEm1.replace(/_{1,3}(.*?)_{1,3}/g, "$1"),
		// 		stripStrike = stripEm2.replace(/~{1,2}(.*?)~{1,2}/g, "$1"),
		// 		stripLink = stripStrike.replace(/!?\[(.*?)]\((.*?)\)/g, "").replace(/!?\[\[(.*?)]]/g, "");
		// 	// return stripLink
		// 	return text
		//
		// }

		// const fileContentStripHTML = filterHTMLAndEmphasis(fileContent)
		// console.log(fileContentStripHTML)
		const lexerResult = marked.lexer(fileContent);

		// console.log(lexerResult)


		lexerResult.map((token) => {

			this.documentProcesser.RecusiveGetToken(token, documents)
		})
		// filter token which is the smallest modulo


	}


}
