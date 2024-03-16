import {App, PluginSettingTab, Setting} from "obsidian";
import HistoricaPlugin from "../main";

export class HistoricaSettingTab extends PluginSettingTab {
	plugin: HistoricaPlugin;

	constructor(app: App, plugin: HistoricaPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): any {
		const {containerEl} = this;
		containerEl.empty();
		const settings = this.plugin.settings;
		new Setting(containerEl)
			.setName("Default Style")
			.setDesc("Choose the default style for the timeline")
			.addDropdown(dropdown => {
				dropdown.addOption('1', 'Style 1')
				dropdown.addOption('2', 'Style 2')
				dropdown.setValue(settings.defaultStyle)
				dropdown.onChange(async (value) => {
					settings.defaultStyle = value
					await this.plugin.saveSettings()
				})
			})
		new Setting(containerEl)
			.setName("Show Summary Title")
			.setDesc("Show short title in the timeline, turn it off if you think it is not smart enough, and this will make this plugin run at fastest speed")
			.addToggle(toggle => {
				toggle.setValue(settings.showUseFulInformation)
				toggle.onChange(async (value) => {
					settings.showUseFulInformation = value
					await this.plugin.saveSettings()
				})
			})
	}

}
