import {Plugin, TFile} from 'obsidian';
import {marked, Token} from "marked";
import {RecusiveGetToken} from "./function/RecusiveGetToken";
import * as fs from "fs";
import {GetTimelineDataFromDocumentArrayWithChrono} from "./function/GetTimelineDataFromDocumentArray";
import {FormatSentencesWithMarkElement} from "./function/FormatSentencesWithMarkElement";
import * as chrono from 'chrono-node';

async function writeCurrentFileToCache() {
	const currentVaultPath = this.app.vault.adapter.basePath
	const cachePath = `${currentVaultPath}/.obsidian/historica-cache.dat`
	const currentFile = this.app.workspace.getActiveFile();
	if (!currentFile) {
		return
	}
	// console.log(currentFile.path)
	fs.writeFileSync(cachePath.trim(), currentFile.path, 'utf8')
}

async function getCurrentFile(): Promise<TFile> {
	let currentFile: TFile | null = this.app.workspace.getActiveFile();
	//@ts-ignore
	if (currentFile instanceof TFile) {

	} else {

		// @ts-ignore
		let currentFilePath = await readCurrentFileFromCache()
		if (currentFilePath) {

			const currentFileAbstract = this.app.vault.getAbstractFileByPath(currentFilePath)
			if (currentFileAbstract instanceof TFile) {
				currentFile = currentFileAbstract
			}
		}

	}
	// @ts-ignore
	return currentFile

}


async function readCurrentFileFromCache() {
	const currentVaultPath = this.app.vault.adapter.basePath
	if (!fs.existsSync(`${currentVaultPath}/.obsidian/historica-cache.json`)) {
		return
	}
	const cachePath = `${currentVaultPath}/.obsidian/historica-cache.json`
	return fs.readFileSync(cachePath, 'utf8')

}

/**
 * parse tfile to documents. documents is a global array that will be updated be side effect after each parse
 * @param file
 * @param documents
 */
async function parseTFileAndUpdateDocuments(file: TFile, documents: Token[]) {
	const lexerResult = marked.lexer(await this.app.vault.read(file));


	lexerResult.map((token) => {

		RecusiveGetToken(token, documents)
	})
	// filter token which is the smallest modulo


}

export default class HistoricaPlugin extends Plugin {


	async onload() {

		// set up wink nlp
		// const nlp = winkNLP(model);

		// set up custom chrono;
		const customChrono = chrono.casual.clone()
		customChrono.parsers.push({
			pattern: () => {
				return /\b(in|at|on|from|to)\s+(\d{4})\b/i
			},
			extract: (context, match) => {
				return {
					day: 1, month: 1, year: parseInt(match[2])
				}
			}
		})


		this.registerMarkdownCodeBlockProcessor("historica", async (source, el, ctx) => {

			// parse yaml in this block
			// const blockConfig = toml.parse(source)
			// console.log(blockConfig)

			const currentFile = await getCurrentFile()
			let documentArray: Token[] = [];
			// <editor-fold desc="parse tfile and update documentArray with singlefile">
			await parseTFileAndUpdateDocuments(currentFile, documentArray)


			// filter token which is the smallest modulo
			documentArray = documentArray.filter((token) => {
				// @ts-ignore
				return token.tokens === undefined
			})
			// </editor-fold>
			// let timelineData = await GetTimelineDataFromDocumentArray(documentArray, nlp)
			let timelineData = await GetTimelineDataFromDocumentArrayWithChrono(documentArray, customChrono)

			const timelineEl = el.createEl('div', {
				cls: "historica-container"
			})

			timelineData.map((entry) => {
				const timelineEntryEl = timelineEl.createEl('div', {
					cls: "historica-entry group"
				})
				// timelineEntryEl.createEl('div', {cls: "historica-label", text: entry.date})
				const verticalLine = timelineEntryEl.createEl('div', {cls: "historica-vertical-line"})
				verticalLine.createEl('time', {cls: "historica-time", text: entry.dateString})
				FormatSentencesWithMarkElement(entry.sentence, timelineEntryEl.createEl('div',
					{cls: "historica-content"}))

			})
			await writeCurrentFileToCache()
		})


		// const ribbonIconEl = this.addRibbonIcon('heart', 'Historica icon', async (evt: MouseEvent) => {
		// 	const yamlText = `title: "Historica"
		// 	date: 2021-10-10`
		// 	// const doc = yaml.load(yamlText.trim())
		// 	console.log(yamlText.trim())
		//
		//
		// });


	}

	async onunload() {
		const currentFile = this.app.workspace.getActiveFile();
		await writeCurrentFileToCache()

	}


}



