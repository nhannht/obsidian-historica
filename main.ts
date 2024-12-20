import { Plugin} from 'obsidian';


import './src/lib/codemirror'
import './src/mode/historica/historica'
import HistoricaBlockManager from "@/src/backgroundLogic/HistoricaBlockManager";
import {DefaultSettings} from "@/src/global";
import ConfigManagerNg from "@/src/ConfigManagerNg";
import HistoricaChrono from "@/src/backgroundLogic/HistoricaChrono";

export default class HistoricaPlugin extends Plugin {
	configManager = new ConfigManagerNg(this, DefaultSettings)

	// historicaFileHelper = new HistoricaFileHelper(this);
	// historicaExportHelper = new HistoricaExportHelper()

	// historicaDocumentProcesser = new HistoricaDocumentProcesser();

	// historicaTimelineRenderer = new HistoricaTimelineRenderer(this)

	// historicaUserBlockProcesser = new HistoricaUserBlockProcesser(this)

	/**
	 * @source
	 */
	historicaChrono = new HistoricaChrono()

	// historicaFileParser = new HistoricaDocumentFileParser(this,this.historicaDocumentProcesser)

	/**
	 * @source
	 */
	blockManager = new HistoricaBlockManager(this)


	/**
	 * @source
	 */
	modesToKeep = ["hypermd", "markdown", "null", "xml"];

	/**
	 * @source
	 */
	refreshLeaves = () => {
		// re-set the editor mode to refresh the syntax highlighting
		//@ts-ignore
		this.app.workspace.iterateCodeMirrors(cm => cm.setOption("mode", cm.getOption("mode")))
	}

	/**
	 * @source
	 */
	darkModeAdapt = () => {
		if (document.body.hasClass("theme-dark")) {
			document.body.addClass("dark")
		} else {
			document.body.removeClass("dark")
		}
	}

	/**
	 * @source
	 */
	registerListener(){
		this.registerEvent(this.app.workspace.on("css-change",()=>{
			this.darkModeAdapt()
		}))
	}

	/**
	 * @source
	 */
	override async onload() {
		// fetch("https://ipinfo.io/json",{
		// 	method:"GET"
		// }).then(response => response.json()).then(data => console.log(data))

		this.darkModeAdapt()
		this.registerListener()
		// await this.configManager.loadSettings()
		// this.app.workspace.iterateCodeMirrors(cm => console.log(cm))
		this.app.workspace.onLayoutReady(() => {
			this.refreshLeaves()

		})

		// await this.blockManager.registerHistoricaBlock()
		await this.blockManager.registerHistoricaBlockNg()


		// this.addSettingTab(new HistoricaSettingTab(this.app, this))


	}

	/**
	 * @source
	 */
	override async onunload() {

		// await this.configManager.saveSettings()
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



