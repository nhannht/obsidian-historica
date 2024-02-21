import {Plugin, TFile} from 'obsidian';
import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";
import {marked, Token} from "marked";
import {RecusiveGetToken} from "./function/RecusiveGetToken";
import * as fs from "fs";
import {GetTimelineDataFromDocumentArray} from "./function/GetTimelineDataFromDocumentArray";
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

async function readCurrentFileFromCache() {
	const currentVaultPath = this.app.vault.adapter.basePath
	if (!fs.existsSync(`${currentVaultPath}/.obsidian/historica-cache.json`)) {
		return
	}
	const cachePath = `${currentVaultPath}/.obsidian/historica-cache.json`
	return fs.readFileSync(cachePath, 'utf8')

}

export default class HistoricaPlugin extends Plugin {


	async onload() {

		// set up wink nlp
		const nlp = winkNLP(model);
		const currentFile = this.app.workspace.getActiveFile();

		this.registerMarkdownCodeBlockProcessor("historica", async (source, el, ctx) => {

			let currentFile = this.app.workspace.getActiveFile();

			if (currentFile instanceof TFile) {
				let currentFileText = await this.app.vault.read(currentFile);
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
			const lexerResult = marked.lexer(await this.app.vault.read(currentFile));

			let documentArray: Token[] = [];


			lexerResult.map((token) => {

				RecusiveGetToken(token, documentArray)
			})
			// filter token which is the smallest modulo
			documentArray = documentArray.filter((token) => {
				// @ts-ignore
				return token.tokens === undefined
			})
			let timelineData = await GetTimelineDataFromDocumentArray(documentArray, nlp)


			const timelineEl = el.createEl('div', {
				cls: "historica-container"
			})

			timelineData.map((entry) => {
				const timelineEntryEl = timelineEl.createEl('div', {
					cls: "historica-entry group"
				})
				timelineEntryEl.createEl('div', {cls: "historica-label", text: "this is the label"})
				const verticalLine = timelineEntryEl.createEl('div', {cls: "historica-vertical-line"})
				verticalLine.createEl('time', {cls: "historica-time", text: entry.date})
				FormatSentencesWithMarkElement(entry.sentence, timelineEntryEl.createEl('div',
					{cls: "historica-content"}))

			})
			await writeCurrentFileToCache()
		})


		const ribbonIconEl = this.addRibbonIcon('heart', 'Historica icon', async (evt: MouseEvent) => {
			const date = chrono.parseDate("11 June 1997")
			console.log(date)
			// @ts-ignore
			console.log(new Date(date).getTime() / 1000)

		});







	}

	async onunload() {
		const currentFile = this.app.workspace.getActiveFile();
		await writeCurrentFileToCache()

	}




}



