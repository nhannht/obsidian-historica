import {Notice, Plugin, TFile} from 'obsidian';
import {Token} from "marked";
import {parse} from "toml";
import compromise from 'compromise';
import corpus from "./corpus.json"

import './src/lib/codemirror'
import './src/mode/historica/historica'
import {HistoricaSetting, HistoricaSettingTab} from "./src/ui/historicaSettingTab";
import ConfigManager from "./src/backgroundLogic/ConfigManager";
import HistoricaUltility from "./src/backgroundLogic/HistoricaUtility";
import HistoricaDocumentProcesser from "./src/backgroundLogic/HistoricaDocumentProcesser";
import HistoricaTimelineRenderer from "./src/ui/HistoricaTimelineRenderer";
import HistoricaUserBlockProcesser, {HistoricaBlockConfig} from "./src/backgroundLogic/HistoricaUserBlockProcesser";

/**
 * The default historica setting
 * showRelativeTime set to true by default because this is old behaviour of this plugin in the very first version, I want to keep backward compatibility
 */
const DEFAULT_SETTINGS: HistoricaSetting = {
	latestFile: "",
	showUseFulInformation: false,
	defaultStyle: "2",
	showRelativeTime: false,
	usingSmartTheme: true

}


// export const HISTORICA_VIEW_TYPE = "historica-note-location"

export default class HistoricaPlugin extends Plugin {
	settingManager = new ConfigManager(this, DEFAULT_SETTINGS)

	historicaUltility = new HistoricaUltility(this);

	historicaDocumentPrcesser = new HistoricaDocumentProcesser(this);

	historicaTimelineRenderer = new HistoricaTimelineRenderer(this)

	historicaUserBlockProcesser = new HistoricaUserBlockProcesser(this)



	modesToKeep = ["hypermd", "markdown", "null", "xml"];

	refreshLeaves = () => {
		// re-set the editor mode to refresh the syntax highlighting
		this.app.workspace.iterateCodeMirrors(cm => cm.setOption("mode", cm.getOption("mode")))
	}

	override async onload() {
		await this.settingManager.loadSettings()
		// this.app.workspace.iterateCodeMirrors(cm => console.log(cm))
		this.app.workspace.onLayoutReady(() => {
			this.refreshLeaves()

		})
		// this.registerEditorExtension(ViewPlugin.fromClass(HistoricaHighlightBlock, {decorations: (plugin) => plugin.decorations}))

		// console.log(corpus)

		const customChrono = await this.historicaUltility.setupCustomChrono()

		this.registerMarkdownCodeBlockProcessor("historica", async (source, el) => {

			// console.log(ctx)

			// parse yaml in this block
			let blockConfig: HistoricaBlockConfig = parse(source)
			// console.log(Object.keys(blockConfig).length === 0)
			blockConfig = await this.historicaUserBlockProcesser.verifyBlockConfig(blockConfig)
			// console.log(blockConfig)


			let tokensWithTypeText: Token[] = [];
			if (blockConfig.include_files === "all") {
				const allFiles = this.app.vault.getMarkdownFiles()
				for (const file of allFiles) {
					await this.historicaDocumentPrcesser.parseTFileAndUpdateDocuments( file, tokensWithTypeText)
				}
			} else if (blockConfig.include_files!.length === 0) {

				let currentFile = await this.historicaUltility.getCurrentFile()
				await this.settingManager.writeLatestFileToData(currentFile)
				// console.log(currentFile)

				await this.historicaDocumentPrcesser.parseTFileAndUpdateDocuments(currentFile, tokensWithTypeText)

			} else if (blockConfig.include_files !== "all" && blockConfig.include_files!.length > 0) {

				for (const file of blockConfig.include_files!) {
					const currentFile = this.app.vault.getAbstractFileByPath(file)
					if (currentFile instanceof TFile) {
						await this.historicaDocumentPrcesser.parseTFileAndUpdateDocuments( currentFile, tokensWithTypeText)
					}
				}
			} else {
				new Notice("No file to include, check your config, include_files may be empty, list of file name or " +
					"simply use 'all' to include all files in the vault")
			}


			tokensWithTypeText = tokensWithTypeText.filter((token) => {
				return "tokens" in token ? token.tokens === undefined : true
			})
			// console.log(tokensWithTypeText)
			// console.log("Query:")
			// console.log(blockConfig.query)


			let timelineData = await this.historicaDocumentPrcesser.GetTimelineDataFromDocumentArrayWithChrono(
				tokensWithTypeText,
				customChrono,
				compromise,
				corpus,
				this.settingManager.settings.showUseFulInformation,
				// @ts-ignore
				blockConfig.query,
				blockConfig.pin_time
			)

			// console.log(timelineData)



			await this.historicaTimelineRenderer.renderTimelineEntry(timelineData, blockConfig, el)
			await this.settingManager.writeLatestFileToData(await this.historicaUltility.getCurrentFile())
		})

		this.addSettingTab(new HistoricaSettingTab(this.app, this))

		// const ribbonIconEl = this.addRibbonIcon('heart', 'Historica icon', async (evt: MouseEvent) => {
		//
		// 	console.log(compromise("human created their first civilization").match("#Noun #Verb #Noun    #Noun").text())
		// 	console.log(compromise("we are all smarter").json())
		//
		//
		//
		// });

	}

	override async onunload() {

		await this.settingManager.writeLatestFileToData( await this.historicaUltility.getCurrentFile())
		// highlight obsidian  code syntax
		// simply ignore the error releated to CodeMirror.modes, we using the built-in cm, esbuild will not touch them
		// @ts-ignore
		for (const key in CodeMirror.modes) {
			// @ts-ignore
			if (CodeMirror.modes.hasOwnProperty(key) && !this.modesToKeep.includes(key)) {
				// @ts-ignore
				delete CodeMirror.modes[key];
			}
			this.refreshLeaves()

		}


	}




}



