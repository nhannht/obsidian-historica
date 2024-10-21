import { Plugin} from 'obsidian';


import './src/lib/codemirror'
import './src/mode/historica/historica'
import {HistoricaSettingTab} from "./src/ui/historicaSettingTab";
import {DefaultSettings} from "./src/global";
import HistoricaBlockManager from "@/src/backgroundLogic/HistoricaBlockManager";
import ConfigManagerNg from "@/src/ConfigManagerNg";
import HistoricaChrono from "@/src/backgroundLogic/HistoricaChrono";

/**
 * The default historica setting
 * showRelativeTime set to true by default because this is old behaviour of this plugin in the very first version, I want to keep backward compatibility
 */



// export const HISTORICA_VIEW_TYPE = "historica-note-location"

export default class HistoricaPlugin extends Plugin {
	configManager = new ConfigManagerNg(this, DefaultSettings)

	// historicaFileHelper = new HistoricaFileHelper(this);
	// historicaExportHelper = new HistoricaExportHelper()

	// historicaDocumentProcesser = new HistoricaDocumentProcesser();

	// historicaTimelineRenderer = new HistoricaTimelineRenderer(this)

	// historicaUserBlockProcesser = new HistoricaUserBlockProcesser(this)

	historicaChrono = new HistoricaChrono()

	// historicaFileParser = new HistoricaDocumentFileParser(this,this.historicaDocumentProcesser)

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

	registerListener(){
		this.registerEvent(this.app.workspace.on("css-change",()=>{
			this.darkModeAdapt()
		}))
	}





	override async onload() {
		// fetch("https://ipinfo.io/json",{
		// 	method:"GET"
		// }).then(response => response.json()).then(data => console.log(data))

		this.darkModeAdapt()
		this.registerListener()
		await this.configManager.loadSettings()
		// this.app.workspace.iterateCodeMirrors(cm => console.log(cm))
		this.app.workspace.onLayoutReady(() => {
			this.refreshLeaves()

		})

		// await this.blockManager.registerHistoricaBlock()
		await this.blockManager.registerHistoricaBlockNg()


		this.addSettingTab(new HistoricaSettingTab(this.app, this))


	}



	override async onunload() {

		await this.configManager.saveSettings()
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



