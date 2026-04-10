import HistoricaPlugin from "../../main";
import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import {DefaultSettings, HistoricaSettings} from "@/src/types";
import {createTimelineStore} from "@/src/store/createTimelineStore";
import {TimelineBlock} from "@/src/ui/TimelineBlock";

import {MarkdownRenderChild} from "obsidian";
function extractBlockId(source: string): string {
	const trimmed = source.trim()
	if (trimmed === "") return "-1"

	// Plain blockId string (alphanumeric, hyphens, underscores)
	if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) return trimmed

	// Legacy JSON format: {"blockId": "abc123", ...}
	try {
		const parsed = JSON.parse(trimmed)
		if (typeof parsed === "object" && parsed !== null && parsed.blockId && parsed.blockId.trim() !== "-1") {
			return parsed.blockId.trim()
		}
	} catch {
		// Not valid JSON — ignore
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
				const settings: HistoricaSettings = {...DefaultSettings, blockId}

				const {store, destroy} = createTimelineStore(this.thisPlugin, settings, ctx)

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

				const child = new MarkdownRenderChild(root)
				child.onunload = () => {
					reactRoot.unmount()
					destroy()
				}
				ctx.addChild(child)
			} catch (e) {
				el.createEl("div", {
					cls: "historica-error",
					text: `Failed to load timeline: ${(e as Error).message}. Use an empty block or a block ID.`
				})
			}
		})
	}
}
