import HistoricaPlugin from "../../main";
import {TFile} from "obsidian";
import {HistoricaSetting} from "../global";

export default class ConfigManager {
	private _plugin: HistoricaPlugin;
	private _settings: HistoricaSetting;
	 constructor(plugin: HistoricaPlugin, defaultSettings: HistoricaSetting){
		this._plugin = plugin
		this._settings = defaultSettings
	}


	 get settings(): HistoricaSetting {
		return this._settings;
	}

	set settings(value: HistoricaSetting) {
		this._settings = value;
	}

	get plugin(): HistoricaPlugin {
		return this._plugin;
	}

	set plugin(value: HistoricaPlugin) {
		this._plugin = value;
	}

	 async loadSettings(){
		this.plugin.configManager.settings = Object.assign({}, this._settings, await this.plugin.loadData())

	}
	async saveSettings(){
		await this.plugin.saveData(this.plugin.configManager.settings)
	}


	 async  writeLatestFileToData( file: TFile) {
	let settings: HistoricaSetting = await this.plugin.loadData()

	if (!settings) {
		settings = {
			latestFile: file.path,
			showUseFulInformation: false,
			defaultStyle: "1",
			showRelativeTime: false,
			usingSmartTheme: true,
			language: "en"

		}

	}
	settings.latestFile = file.path
	await this.plugin.saveData(settings)

}



}
