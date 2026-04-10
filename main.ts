import {Plugin} from 'obsidian';
import HistoricaBlockManager from "@/src/backgroundLogic/HistoricaBlockManager";
import HistoricaChrono from "@/src/compute/ChronoParser";
import {registerHmdPostProcessor} from "@/src/data/HmdPostProcessor";
import {hmdEditorExtension} from "@/src/data/HmdEditorExtension";

export default class HistoricaPlugin extends Plugin {
	historicaChrono = new HistoricaChrono()
	blockManager = new HistoricaBlockManager(this)

	darkModeAdapt = () => {
		if (document.body.hasClass("theme-dark")) {
			document.body.addClass("dark")
		} else {
			document.body.removeClass("dark")
		}
	}

	registerListener() {
		this.registerEvent(this.app.workspace.on("css-change", () => {
			this.darkModeAdapt()
		}))
	}

	override async onload() {
		this.darkModeAdapt()
		this.registerListener()
		registerHmdPostProcessor(this);
		this.registerEditorExtension(hmdEditorExtension(this));
		await this.blockManager.registerHistoricaBlockNg()
	}

	override async onunload() {
	}
}
