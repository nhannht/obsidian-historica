import HistoricaPlugin from "@/main";
import {HistoricaSettingNg} from "@/src/global";

export default class ConfigManagerNg {


	constructor(public plugin: HistoricaPlugin, public settings: HistoricaSettingNg) {

	}



	async loadSettings() {
		this.plugin.configManager.settings = Object.assign({}, this.settings, await this.plugin.loadData())

	}

	async saveSettings() {
		await this.plugin.saveData(this.plugin.configManager.settings)
	}



}
