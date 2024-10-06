import HistoricaPlugin from "../../main";
import {HistoricaBlockConfig} from "./HistoricaUserBlockProcesser";
import {Token} from "marked";
import {MarkdownPostProcessorContext, Notice, TFile} from "obsidian";
import compromise from "compromise";
import corpus from "../../corpus.json";
import {parse as TomlParse} from "toml";
import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import {HistoricaSettingNg} from "@/src/global";
import {HistoricaBlockReactComponent} from "@/src/backgroundLogic/HistoricaBlockReactComponent";
import TOML from "@ltd/j-toml"

const defaultSettings: HistoricaSettingNg = {
	path_list: ["CurrentFile"],
	style: "default",
	language: "en",
	implicit_time: false,
	summary: false,
	smart_theme: true

}

async function UpdateBlockSetting(settings: HistoricaSettingNg,
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
			JSON.stringify(settings, null, "\t"), "\n")
		// console.log(linesFromFile)
		const newSettingsString = linesFromFile.join("")
		const file = thisPlugin.app.vault.getAbstractFileByPath(sourcePath)
		if (file) {
			if (file instanceof TFile) {
				await thisPlugin.app.vault.modify(file, newSettingsString)
			}
		}
	}

}


export default class HistoricaBlockManager {
	constructor(public thisPlugin: HistoricaPlugin) {
	}

	async registerHistoricaBlockNg() {

		this.thisPlugin.registerMarkdownCodeBlockProcessor("historica-ng", async (source, el, ctx) => {
			// console.log(TOML.parse(source))

			const settings: HistoricaSettingNg|any  = source.trim() === "" ? defaultSettings : TOML.parse(source)
			console.log(settings)
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
						settings={settings}
					/>
				</StrictMode>
			)
		})
	}

	async registerHistoricaBlock() {
		this.thisPlugin.registerMarkdownCodeBlockProcessor("historica", async (source, el) => {

			// console.log(ctx)

			// parse yaml in this block
			let blockConfig: HistoricaBlockConfig = TomlParse(source)
			// console.log(Object.keys(blockConfig).length === 0)
			blockConfig = await this.thisPlugin.historicaUserBlockProcesser.verifyBlockConfig(blockConfig)
			const customChrono = await this.thisPlugin.historicaChrono.setupCustomChrono(blockConfig.language)

			// console.log(blockConfig)


			let tokensWithTypeText: Token[] = [];
			if (blockConfig.include_files === "all") {
				const allFiles = this.thisPlugin.app.vault.getMarkdownFiles()
				for (const file of allFiles) {
					await this.thisPlugin.historicaFileParser.parseTFileAndUpdateDocuments(file, tokensWithTypeText)
				}
			} else if (blockConfig.include_files!.length === 0) {

				let currentFile = await this.thisPlugin.historicaFileHelper.getCurrentFile()
				await this.thisPlugin.configManager.writeLatestFileToData(currentFile)
				// console.log(currentFile)

				await this.thisPlugin.historicaFileParser.parseTFileAndUpdateDocuments(currentFile, tokensWithTypeText)

			} else if (blockConfig.include_files !== "all" && blockConfig.include_files!.length > 0) {

				for (const file of blockConfig.include_files!) {
					const currentFile = this.thisPlugin.app.vault.getAbstractFileByPath(file)
					if (currentFile instanceof TFile) {
						await this.thisPlugin.historicaFileParser.parseTFileAndUpdateDocuments(currentFile, tokensWithTypeText)
					}
				}
			} else {
				new Notice("No file to include, check your config, include_files may be empty, list of file name or " +
					"simply use 'all' to include all files in the vault")
			}


			tokensWithTypeText = tokensWithTypeText.filter((token) => {
				return "tokens" in token ? token.tokens === undefined : true
			})
			// console.log(tokensWithTypeText)
			// console.log("Query:")
			// console.log(blockConfig.query)


			let timelineData = await this.thisPlugin.historicaDocumentProcesser
				.GetTimelineDataFromDocumentArrayWithChrono(
					tokensWithTypeText,
					customChrono,
					compromise,
					corpus,
					this.thisPlugin.configManager.settings.showUseFulInformation,
					// @ts-ignore
					blockConfig.query,
					blockConfig.pin_time
				)

			// console.log(timelineData)


			await this.thisPlugin.historicaTimelineRenderer.renderTimelineEntry(timelineData, blockConfig, el)
			await this.thisPlugin.configManager.writeLatestFileToData(await this.thisPlugin.historicaFileHelper.getCurrentFile())
		})

	}
}
