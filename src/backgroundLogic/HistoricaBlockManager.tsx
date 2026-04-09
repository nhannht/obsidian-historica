import HistoricaPlugin from "../../main";
import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import {DefaultSettings, HistoricaSettingNg} from "@/src/types";
import {createTimelineStore} from "@/src/store/createTimelineStore";
import {TimelineBlock} from "@/src/ui/TimelineBlock";

function normalizeSettings(settings: Partial<HistoricaSettingNg>): HistoricaSettingNg {
	return {
		style: ["default", "1"].includes(settings.style as string) ? (settings.style as HistoricaSettingNg["style"]) : DefaultSettings.style,
		pin_time: settings.pin_time ?? DefaultSettings.pin_time,
		blockId: settings.blockId && settings.blockId.trim() !== "-1" ? settings.blockId : DefaultSettings.blockId,
		header: settings.header ?? DefaultSettings.header,
		footer: settings.footer ?? DefaultSettings.footer,
	}
}

export default class HistoricaBlockManager {
	constructor(public thisPlugin: HistoricaPlugin) {
	}

	async registerHistoricaBlockNg() {
		this.thisPlugin.registerMarkdownCodeBlockProcessor("historica", async (source, el, ctx) => {
			try {
				const parsed = source.trim() === "" ? {} : JSON.parse(source)
				const settings = normalizeSettings(parsed)

				const store = createTimelineStore(this.thisPlugin, settings, ctx)

				const root = el.createEl("div", {cls: "root"})
				const reactRoot = createRoot(root)

				reactRoot.render(
					<StrictMode>
						<TimelineBlock
							store={store}
							plugin={this.thisPlugin}
						/>
					</StrictMode>
				)
			} catch (e) {
				el.createEl("div", {
					cls: "historica-error",
					text: `Failed to load timeline: ${(e as Error).message}. Use an empty block or valid JSON.`
				})
			}
		})
	}
}
