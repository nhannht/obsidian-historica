import HistoricaPlugin from "../main";
import {Notice, Plugin, TFile} from "obsidian"
import {parseTFileAndUpdateDocuments} from "./parseTFileAndUpdateDocuments";
import {writeLatestFileToData} from "./writeLatestFileToData";
import {Token} from "marked";
import {getCurrentFile} from "./getCurrentFile";

export interface HistoricaQuery {
	start: string,
	end: string
}

export interface BlockConfig {
	style: number | 1,
	include_files?: string[] | string,
	query?: HistoricaQuery | HistoricaQuery[],
	pin_time?: string | null,


}

export async function verifyBlockConfig(blockConfig: BlockConfig, thisPlugin: HistoricaPlugin) {
	if (Object.keys(blockConfig).length === 0) {
		const defaultStyle = thisPlugin.settings.defaultStyle
		blockConfig = {
			style: parseInt(defaultStyle),
			include_files: [],
			query: [],
			pin_time: "",

			// exclude_files: []
		}
		return blockConfig

	}
	// console.log(blockConfig)
	// default style if style not setup
	if (![1, 2].includes(blockConfig.style) || !blockConfig.style) {
		blockConfig.style = parseInt(thisPlugin.settings.defaultStyle)

	}
	// default include files if include files not setup
	if (!blockConfig.include_files) {
		blockConfig.include_files = []
	}

	let query: HistoricaQuery[] = []

	if (!blockConfig.query) {
		query = []
	} else if (Object.keys(blockConfig.query).length === 0) {
		query = []
	} else if (!Array.isArray(blockConfig.query)) {
		query = [blockConfig.query]
	} else if (Array.isArray(blockConfig.query) && blockConfig.query[0].start) {
		query = blockConfig.query
	} else {
		query = []
		new Notice("Your query is not valid, please check your query")
	}
	blockConfig.query = query


	// default pin time if pin time not setup
	if (!blockConfig.pin_time || blockConfig.pin_time && blockConfig.pin_time.trim() === "") {
		blockConfig.pin_time = "now"
	}



	return blockConfig
}