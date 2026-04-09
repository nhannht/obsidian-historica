import HistoricaPlugin from "../../main";
import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import {DefaultSettings, HistoricaSettingNg} from "@/src/types";
import {createTimelineStore} from "@/src/store/createTimelineStore";
import {TimelineBlock} from "@/src/ui/TimelineBlock";

function extractBlockId(source: string): string {
	const trimmed = source.trim()
	if (trimmed === "") return "-1"

	// Try JSON parse (legacy format: {"blockId": "abc123", ...})
	try {
		const parsed = JSON.parse(trimmed)
		if (parsed.blockId && parsed.blockId.trim() !== "-1") return parsed.blockId.trim()
	} catch {
		// Not JSON — treat the whole string as a blockId
		if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) return trimmed
	}
	return "-1"
}

export default class HistoricaBlockManager {
	constructor(public thisPlugin: HistoricaPlugin) {
	}

	async registerHistoricaBlockNg() {
		this.thisPlugin.registerMarkdownCodeBlockProcessor("historica", async (source, el, ctx) => {
			try {
				const blockId = extractBlockId(source)
				const settings: HistoricaSettingNg = {...DefaultSettings, blockId}

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
					text: `Failed to load timeline: ${(e as Error).message}. Use an empty block or a block ID.`
				})
			}
		})
	}
}
