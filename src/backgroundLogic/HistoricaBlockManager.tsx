import HistoricaPlugin from "../../main";
import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import {DefaultSettings, GenerateBlockId, HistoricaSettingNg, HistoricaSupportLanguages} from "@/src/global";
import {HistoricaBlockReactComponent} from "@/src/backgroundLogic/HistoricaBlockReactComponent";

function fixSettingProblem(settings: HistoricaSettingNg) {
	if (!settings.path_option || settings.path_option.length === 0 || !["all","current","custom"].includes(settings.path_option) ) settings.path_option = DefaultSettings.path_option
	// if (!settings.smart_theme) settings.smart_theme = true
	if ([1,2,3,"default","1","2","3"].indexOf(settings.style) === -1 || !settings.style) settings.style = DefaultSettings.style
	if (HistoricaSupportLanguages.indexOf(settings.language) === -1 || !settings.language) settings.language = DefaultSettings.language
	if (!settings.summary) settings.summary = DefaultSettings.summary
	// if (!settings.query || !Array.isArray(settings.query) ) settings.query = DefaultSettings.query
	if (!settings.include_files || !Array.isArray(settings.include_files)) settings.include_files = DefaultSettings.include_files
	if (!settings.pin_time || settings.pin_time.trim() === "") settings.pin_time = DefaultSettings.pin_time
	if (!settings.custom_path || !Array.isArray(settings.include_files)) settings.custom_path = DefaultSettings.custom_path
	if (!settings.sort || !["asc","desc"].includes(settings.sort.trim().toLowerCase()) ) settings.sort = DefaultSettings.sort
	if (!settings.blockId || settings.blockId.toLowerCase().trim() === "-1") settings.blockId = GenerateBlockId()
	// if (!settings.a || !Array.isArray(settings.custom_units)) settings.custom_units = DefaultSettings.custom_units

	return settings
}


export default class HistoricaBlockManager {
	constructor(public thisPlugin: HistoricaPlugin) {
	}

	async registerHistoricaBlockNg() {

		this.thisPlugin.registerMarkdownCodeBlockProcessor("historica-ng", async (source, el, ctx) => {
			// console.log(TOML.parse(source))
			// setting will be ensure always correct via 3 phase, from config manager, from the block, and if the config still undefined, it will be populated with the default config constant again via validate
			let  settings: HistoricaSettingNg  = source.trim() === "" ? this.thisPlugin.configManager.settings : JSON.parse(source) as unknown as HistoricaSettingNg
			settings = fixSettingProblem(settings)

			// console.log(settings)
			// console.log(settings.query)
			let root = el.createEl("div", {
				cls: "root"
			})
			let reactRoot = createRoot(root)

			reactRoot.render(
				<StrictMode>
					<HistoricaBlockReactComponent
						src={source}
						ctx={ctx}
						plugin={this.thisPlugin}
						setting={settings}
					/>
				</StrictMode>
			)
		})
	}

}
