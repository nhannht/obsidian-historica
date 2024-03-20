import {Plugin, TFile} from "obsidian";
import {marked, Token} from "marked";
import {RecusiveGetToken} from "./RecusiveGetToken";

/**
 * parse tfile to documents. documents is a global array that will be updated be side effect after each parse
 * @param currentPlugin
 * @param file
 * @param documents
 */
export async function parseTFileAndUpdateDocuments(currentPlugin: Plugin, file: TFile | null, documents: Token[]) {
	if (!file) {
		return
	}
	const fileContent = await currentPlugin.app.vault.read(file)

	function filterHTMLAndEmphasis(text: string) {
		const stripHTML = text.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, ""),
			stripEm1 = stripHTML.replace(/\*{1,3}(.*?)\*{1,3}/g, "$1"),
			stripEm2 = stripEm1.replace(/_{1,3}(.*?)_{1,3}/g, "$1"),
			stripStrike = stripEm2.replace(/~{1,2}(.*?)~{1,2}/g, "$1"),
			stripLink = stripStrike.replace(/!?\[(.*?)]\((.*?)\)/g, "").replace(/!?\[\[(.*?)]]/g, "");
		return stripLink

	}

	const fileContentStripHTML = filterHTMLAndEmphasis(fileContent)
	// console.log(fileContentStripHTML)
	const lexerResult = marked.lexer(fileContentStripHTML);

	// console.log(lexerResult)


	lexerResult.map((token) => {

		RecusiveGetToken(token, documents)
	})
	// filter token which is the smallest modulo


}
