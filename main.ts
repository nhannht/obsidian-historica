import { Plugin} from 'obsidian';


import './src/lib/codemirror'
import './src/mode/historica/historica'
import {HistoricaSettingTab} from "./src/ui/historicaSettingTab";
import ConfigManager from "./src/backgroundLogic/ConfigManager";
import HistoricaFileHelper from "./src/backgroundLogic/HistoricaFileHelper";
import HistoricaDocumentProcesser from "./src/backgroundLogic/HistoricaDocumentProcesser";
import HistoricaTimelineRenderer from "./src/ui/HistoricaTimelineRenderer";
import HistoricaUserBlockProcesser from "./src/backgroundLogic/HistoricaUserBlockProcesser";
import HistoricaChrono from "./src/backgroundLogic/HistoricaChrono";
import HistoricaDocumentFileParser from "./src/backgroundLogic/HistoricaDocumentFileParser";
import HistoricaExportHelper from "./src/backgroundLogic/HistoricaExportHelper";
import {HistoricaSetting} from "./src/global";
import HistoricaBlockManager from "@/src/backgroundLogic/HistoricaBlockManager";

/**
 * The default historica setting
 * showRelativeTime set to true by default because this is old behaviour of this plugin in the very first version, I want to keep backward compatibility
 */
const DEFAULT_SETTINGS: HistoricaSetting = {
	latestFile: "",
	showUseFulInformation: false,
	defaultStyle: "2",
	showRelativeTime: false,
	usingSmartTheme: true,
	language: "en",
	pathListFilter: ["CurrentFile"]

}


// export const HISTORICA_VIEW_TYPE = "historica-note-location"

export default class HistoricaPlugin extends Plugin {
	configManager = new ConfigManager(this, DEFAULT_SETTINGS)

	historicaFileHelper = new HistoricaFileHelper(this);
	historicaExportHelper = new HistoricaExportHelper()

	historicaDocumentProcesser = new HistoricaDocumentProcesser();

	historicaTimelineRenderer = new HistoricaTimelineRenderer(this)

	historicaUserBlockProcesser = new HistoricaUserBlockProcesser(this)

	historicaChrono = new HistoricaChrono()

	historicaFileParser = new HistoricaDocumentFileParser(this,this.historicaDocumentProcesser)

	blockManager = new HistoricaBlockManager(this)


	modesToKeep = ["hypermd", "markdown", "null", "xml"];

	refreshLeaves = () => {
		// re-set the editor mode to refresh the syntax highlighting
		this.app.workspace.iterateCodeMirrors(cm => cm.setOption("mode", cm.getOption("mode")))
	}

	darkModeAdapt = () => {
		if (document.body.hasClass("theme-dark")) {
			document.body.addClass("dark")
		} else {
			document.body.removeClass("dark")
		}
	}

	override async onload() {
		this.darkModeAdapt()
		await this.configManager.loadSettings()
		// this.app.workspace.iterateCodeMirrors(cm => console.log(cm))
		this.app.workspace.onLayoutReady(() => {
			this.refreshLeaves()

		})
		// this.registerEditorExtension(ViewPlugin.fromClass(HistoricaHighlightBlock, {decorations: (plugin) => plugin.decorations}))

		// console.log(corpus)

		await this.blockManager.registerHistoricaBlock()
		await this.blockManager.registerHistoricaBlockNg()


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

		await this.configManager.writeLatestFileToData(await this.historicaFileHelper.getCurrentFile())
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



