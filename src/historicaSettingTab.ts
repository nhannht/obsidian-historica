import {App, PluginSettingTab, Setting} from "obsidian";
import HistoricaPlugin from "../main";

export interface HistoricaSetting {
	latestFile: string
	showUseFulInformation: boolean
	defaultStyle: string,
	showRelativeTime: boolean,
	usingSmartTheme: boolean,
}
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

		new Setting(containerEl)
			.setName("Implicit date showing in the time entry")
			.setDesc("Example, your current date as 2024/Mar/20," +
				"a string like '2 day ago' will be show explicit as '2024/Mar/18' if you turn this option off")
			.addToggle(toggle => {
				toggle.setValue(settings.showRelativeTime)
				toggle.onChange(async (value) => {
					settings.showRelativeTime = value
					await this.plugin.saveSettings()
				})
			})

		new Setting(containerEl)
			.setName("Smart theme")
			.setDesc("Theme that dynamic change base on your current obsidian  theme, turn it off if you want to using classic theme of Historica - Legend Larva")
			.addToggle(toggle => {
				toggle.setValue(settings.usingSmartTheme)
				toggle.onChange(async (value) => {
					settings.usingSmartTheme = value
					await this.plugin.saveSettings()
				})
			})
	}

}

