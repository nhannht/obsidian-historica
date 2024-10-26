import HistoricaPlugin from "../../main";
import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import {DefaultSettings, HistoricaSettingNg, HistoricaSupportLanguages} from "@/src/global";
import {HistoricaMotherReactComponent} from "@/src/backgroundLogic/HistoricaMotherReactComponent";

function fixSettingProblem(settings: HistoricaSettingNg) {
	if ([1,2,3,"default","1","2","3"].indexOf(settings.style) === -1 || !settings.style) settings.style = DefaultSettings.style
	if (HistoricaSupportLanguages.indexOf(settings.language) === -1 || !settings.language) settings.language = DefaultSettings.language
	if (!settings.pin_time) settings.pin_time = DefaultSettings.pin_time
	if (!settings.blockId || settings.blockId.toLowerCase().trim() === "-1") settings.blockId = DefaultSettings.blockId
	if (!settings.header) settings.header = DefaultSettings.header
	if (!settings.footer) settings.footer = DefaultSettings.footer

	return settings
}



export default class HistoricaBlockManager {
	constructor(public thisPlugin: HistoricaPlugin) {
	}

	async registerHistoricaBlockNg() {

		this.thisPlugin.registerMarkdownCodeBlockProcessor("historica", async (source, el, ctx) => {
			// console.log(TOML.parse(source))
			// setting will be ensure always correct via 3 phase, from config manager, from the block, and if the config still undefined, it will be populated with the default config constant again via validate
			let  settings: HistoricaSettingNg  = source.trim() === "" ? DefaultSettings : JSON.parse(source) as unknown as HistoricaSettingNg
			settings = fixSettingProblem(settings)
			// console.log(settings)

			// console.log(settings)
			// console.log(settings.query)
			let root = el.createEl("div", {
				cls: "root"
			})
			let reactRoot = createRoot(root)

			reactRoot.render(
				<StrictMode>
					<HistoricaMotherReactComponent
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
