import HistoricaPlugin from "../../main";

import {MarkdownPostProcessorContext, MarkdownView, TFile} from "obsidian";
import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import {HistoricaSettingNg, HistoricaSupportLanguages} from "@/src/global";
import {HistoricaBlockReactComponent} from "@/src/backgroundLogic/HistoricaBlockReactComponent";
import TOML from "@ltd/j-toml"

export async function UpdateBlockSetting(settings: HistoricaSettingNg,
								  blockCtx: MarkdownPostProcessorContext,
								  thisPlugin: HistoricaPlugin
) {
	const sourcePath = blockCtx.sourcePath
	//@ts-expect-error: el not define in blockCtx
	const elInfo = blockCtx.getSectionInfo(blockCtx.el)
	// console.log(elInfo)
	if (elInfo) {
		// console.log(elInfo.text)
		let linesFromFile = elInfo.text.split(/(.*?\n)/g)
		linesFromFile.forEach((e: string, i: number) => {
			if (e === "") linesFromFile.splice(i, 1)
		})
		// console.log(linesFromFile)
		linesFromFile.splice(elInfo.lineStart + 1,
			elInfo.lineEnd - elInfo.lineStart - 1,
			TOML.stringify(settings, {
				indent: "\t",
				newline:"\n"
			}), "\n")
		// console.log(linesFromFile)
		const newSettingsString = linesFromFile.join("")
		const file = thisPlugin.app.vault.getAbstractFileByPath(sourcePath)
		if (file) {
			if (file instanceof TFile) {
				await thisPlugin.app.vault.modify(file, newSettingsString)
			}
		}
	}

	// scroll back to the location of this block, why we need it because Obsidian behaviour so stupid and keep scrolling around after we modify the file uisng api
	const currentFile = thisPlugin.app.workspace.getActiveFile()
	if (currentFile instanceof TFile){
		const leaf = thisPlugin.app.workspace.getLeaf(false)
		await leaf.openFile(currentFile)
		await leaf.setViewState({
			type: "markdown",
		})
		let view = leaf.view as MarkdownView
		view.editor.setCursor({
			line:elInfo?.lineStart ? elInfo.lineEnd : 0,
			ch: 0,
		})
	}

}

function validateSetting(settings: HistoricaSettingNg) {
	if (!settings.path_option || settings.path_option.length === 0) settings.path_option = "current"
	if (!settings.smart_theme) settings.smart_theme = true
	if ([1,2,3,"default","1","2","3"].indexOf(settings.style) === -1 || !settings.style) settings.style = 1
	if (HistoricaSupportLanguages.indexOf(settings.language) === -1 || !settings.language) settings.language = "en"
	if (!settings.summary) settings.summary = false
	if (!settings.query ) settings.query = {}
	if (!settings.include_files || !Array.isArray(settings.include_files)) settings.include_files = []
	if (!settings.pin_time || settings.pin_time.trim() === "") settings.pin_time = "now"
	if (!settings.custom_path || !Array.isArray(settings.include_files)) settings.custom_path = []
	return settings
}


export default class HistoricaBlockManager {
	constructor(public thisPlugin: HistoricaPlugin) {
	}

	async registerHistoricaBlockNg() {

		this.thisPlugin.registerMarkdownCodeBlockProcessor("historica-ng", async (source, el, ctx) => {
			// console.log(TOML.parse(source))
			let  settings: HistoricaSettingNg  = source.trim() === "" ? this.thisPlugin.configManager.settings : TOML.parse(source) as unknown as HistoricaSettingNg
			settings = validateSetting(settings)

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
						thisPlugin={this.thisPlugin}
						setting={settings}
					/>
					{/*<RouterProvider router={router} />*/}
				</StrictMode>
			)
		})
	}

}
