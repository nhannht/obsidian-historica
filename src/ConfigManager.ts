import HistoricaPlugin from "../main";
import {HistoricaSetting} from "./historicaSettingTab";

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


}
