import HistoricaPlugin, {HistoricaQuery} from "../main";
import {Notice, Plugin, TFile} from "obsidian"
import {parseTFileAndUpdateDocuments} from "./parseTFileAndUpdateDocuments";
import {writeLatestFileToData} from "./writeLatestFileToData";
import {Token} from "marked";
import {getCurrentFile} from "./getCurrentFile";

export interface BlockConfig {
	style: number | 1,
	include_files?: string[] | string,
	query: HistoricaQuery | HistoricaQuery[]


}

export async function verifyBlockConfig(blockConfig: BlockConfig, thisPlugin: HistoricaPlugin) {
	if (Object.keys(blockConfig).length === 0) {
		const defaultStyle = thisPlugin.settings.defaultStyle
		blockConfig = {
			style: parseInt(defaultStyle),
			include_files: [],
			query: []

			// exclude_files: []
		}
		return blockConfig

	}
	// console.log(blockConfig)

	if (![1, 2].includes(blockConfig.style) || !blockConfig.style) {
		blockConfig.style = parseInt(thisPlugin.settings.defaultStyle)

	}

	if (!blockConfig.include_files) {
		blockConfig.include_files = []
	}

	return blockConfig
}
