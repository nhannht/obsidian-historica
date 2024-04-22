import HistoricaPlugin from "../../main";
import {HistoricaSetting} from "../ui/historicaSettingTab";
import {TFile} from "obsidian";

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
		this.plugin.settingManager.settings = Object.assign({}, this._settings, await this.plugin.loadData())

	}
	async saveSettings(){
		await this.plugin.saveData(this.plugin.settingManager.settings)
	}


	 async  writeLatestFileToData( file: TFile) {
	let settings: HistoricaSetting = await this.plugin.loadData()

	if (!settings) {
		settings = {
			latestFile: file.path,
			showUseFulInformation: false,
			defaultStyle: "1",
			showRelativeTime: false,
			usingSmartTheme: true

		}

	}
	settings.latestFile = file.path
	await this.plugin.saveData(settings)

}



}
