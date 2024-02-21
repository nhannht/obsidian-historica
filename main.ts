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
		// const nlp = winkNLP(model);

		// set up custom chrono;
		const customChrono = chrono.casual.clone()
		customChrono.parsers.push({
			pattern: () => {
				return /\b(in|at|on|from|to)\s+(\d{4})\b/i
			},
			extract: (context, match) => {
				return {
					day: 1, month:1 , year: parseInt(match[2])
				}
			}
		})
		// console.log(customChrono.parseDate("In Christmas i was born"))


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


		const ribbonIconEl = this.addRibbonIcon('heart', 'Historica icon', async (evt: MouseEvent) => {
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


			// @ts-ignore
			// console.log(new Date(date).getTime() / 1000)

		});


	}

	async onunload() {
		const currentFile = this.app.workspace.getActiveFile();
		await writeCurrentFileToCache()

	}


}



