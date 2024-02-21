import {App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting, TFile} from 'obsidian';
import winkNLP, {WinkMethods} from "wink-nlp";
import model from "wink-eng-lite-web-model";
import {marked, Token} from "marked";
import {RecusiveGetToken} from "./src/RecusiveGetToken";


interface HistoricaPluginSettingInterface {
	mySetting: string;
}

// default setting of historica
const DEFAULT_SETTINGS: HistoricaPluginSettingInterface = {
	mySetting: 'default'
}

type TimelineEntry = {
	date: string;
	unixTime: number;
	sentence: string;

}

/**
 * get timeline data from document array, the document array is the output from lexical parser of mark.js
 * @example
 * const lexerResult = marked.lexer(await this.app.vault.read(currentFile));
 let documentArray: Token[] = [];
 lexerResult.map((token) => {
 RecusiveGetToken(token, documentArray)
 })
 */
async function getTimelineDataFromDocumentArray(documents: Token[] | null, nlp: WinkMethods) {
	let timeline: TimelineEntry[] = []
	// learn new entities pattern must occur before read doc
	nlp.learnCustomEntities([
		{name: 'custom date', patterns: ['DATE']}
	]);
	documents?.forEach((token) => {

		//@ts-ignore
		const doc = nlp.readDoc(token.text);
		// Extract entities.

		doc.customEntities().each((entity) => {

			entity.markup("<historica-mark>", "</historica-mark>")
			// console.log(entity.out())
			const eventDate = entity.out()
			timeline.push({
				date: eventDate,
				unixTime: new Date(eventDate).getTime() / 1000,
				sentence: entity.parentSentence().out(nlp.its.markedUpText)
			})
		});
	})

	return timeline.sort((a, b) => {
		return a.unixTime - b.unixTime

	})

}

function formatSentencesWithMarkElement(sen: string, el: HTMLElement) {
	// split base on regex <mark>.*</mark>
	const regex = /(<historica-mark>.*<\/historica-mark>)/g
	const parts = sen.split(regex)
	// console.log(parts)
	for (let i = 0; i < parts.length; i++) {
		if (regex.test(parts[i])) {
			// @ts-ignore
			el.createEl('historica-mark', {
				text: parts[i]
					.replace(/<historica-mark>/g, "")
					.replace(/<\/historica-mark>/g, "")
			})
		} else {
			el.createEl('span', {
				text: parts[i]
			})
		}
	}
}


export default class HistoricaPlugin extends Plugin {
	settings: HistoricaPluginSettingInterface;

	async onload() {

		// set up wink nlp
		const nlp = winkNLP(model);

		this.registerMarkdownCodeBlockProcessor("historica", async (source, el, ctx) => {
			const lexerResult = marked.lexer(await this.app.vault.read(<TFile>this.app.workspace.getActiveFile()));

			let documentArray: Token[] = [];


			lexerResult.map((token) => {

				RecusiveGetToken(token, documentArray)
			})
			// filter token which is the smallest modulo
			documentArray = documentArray.filter((token) => {
				// @ts-ignore
				return token.tokens === undefined
			})
			let timelineData = await getTimelineDataFromDocumentArray(documentArray, nlp)


			const timelineEl = el.createEl('div', {
				cls: "historica-container"
			})

			timelineData.map((entry) => {
				const timelineEntryEl = timelineEl.createEl('div', {
					cls: "historica-entry group"
				})
				// timelineEntryEl.createEl('div', {cls: "historica-label", text: "this is the label"})
				const verticalLine = timelineEntryEl.createEl('div', {cls: "historica-vertical-line"})
				verticalLine.createEl('time', {cls: "historica-time", text: entry.date})
				formatSentencesWithMarkElement(entry.sentence, timelineEntryEl.createEl('div',
					{cls: "historica-content"}))


			})
		})


		// const ribbonIconEl = this.addRibbonIcon('heart', 'Historica icon', async (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	const currentFile = this.app.workspace.getActiveFile();
		// 	if (currentFile instanceof TFile) {
		// 		const lexerResult = marked.lexer(await this.app.vault.read(currentFile));
		// 		// console.log(lexerResult)
		//
		// 		let documentArray: Token[] = [];
		//
		//
		// 		lexerResult.map((token) => {
		//
		// 			RecusiveGetToken(token, documentArray)
		// 		})
		// 		// filter token which is the smallest modulo
		// 		documentArray = documentArray.filter((token) => {
		// 			// @ts-ignore
		// 			return token.tokens === undefined
		// 		})
		// 		let timelineData = await getTimelineDataFromDocumentArray(documentArray, nlp)
		// 		console.log(timelineData)
		//
		//
		// 		// console.log(documentArray)
		// 	}
		// });
		// Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');









	}

	onunload() {

	}


}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: HistoricaPlugin;

	constructor(app: App, plugin: HistoricaPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

	}
}
