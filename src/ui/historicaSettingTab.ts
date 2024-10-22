import {App, PluginSettingTab, Setting} from "obsidian";
import HistoricaPlugin from "../../main";

// oh my god, it took hilarious cumplicated piece of shit-code to make a setting ui
export class HistoricaSettingTab extends PluginSettingTab {
	plugin: HistoricaPlugin;

	constructor(app: App, plugin: HistoricaPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): any {
		const {containerEl} = this;
		containerEl.empty();
		const settings = this.plugin.configManager.settings;
		new Setting(containerEl)
			.setName("Default Style")
			.setDesc("Choose the default style for the timeline")
			.addDropdown(dropdown => {
				dropdown.addOption('1', 'Style 1')
				dropdown.addOption('2', 'Style 2')
				dropdown.addOption('3','Style 3')
				dropdown.setValue(settings.style.toString())
				dropdown.onChange(async (value) => {
					if (["1","2","3"].includes(value.trim())){
						//@ts-ignore
						settings.style = value
					}
					await this.plugin.configManager.saveSettings()
				})
			})



		new Setting(containerEl)
			.setName("Language support")
			.setDesc("Historica only support one language at the same time")
			.addDropdown(dropdown => {
				dropdown.addOption('en',"English (International)")
				dropdown.addOption("uk","Ukrainian")
				dropdown.addOption('fr',"French")
				dropdown.addOption("de","Deutsch")
				// dropdown.addOption("ja","Japanese")
				dropdown.addOption("nl","Dutch")
				dropdown.addOption("ru","Russian")
				dropdown.addOption("pt","Portugues")
				// dropdown.addOption("zh.hant","Chinese (Traditional)")


				dropdown.setValue(settings.language)

				dropdown.onChange(async (value) => {
					//@ts-ignore
					settings.language = value
					await this.plugin.configManager.saveSettings()
				})


			})

	}

}

