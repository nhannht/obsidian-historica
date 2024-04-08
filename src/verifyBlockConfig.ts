import HistoricaPlugin from "../main";
import {Notice} from "obsidian"


export interface HistoricaQuery {
	start: string,
	end: string
}

export interface HistoricaBlockConfig {
	style: number,
	include_files?: string[] | string,
	query?: HistoricaQuery | HistoricaQuery[],
	pin_time?: string | null,
	smart_theme: boolean,
	implicit_time: boolean
}

export async function verifyBlockConfig(blockConfig: HistoricaBlockConfig, thisPlugin: HistoricaPlugin) {


	// STYLE
	// console.log(blockConfig)
	// default style if style not setup
	if (![1, 2].includes(blockConfig.style) || !blockConfig.style) {
		blockConfig.style = parseInt(thisPlugin.settingManager.settings.defaultStyle)

	}
	// INCLUDE_FILES
	// default include files if include files not setup
	if (!blockConfig.include_files) {
		blockConfig.include_files = []
	}
	// QUERY

	let query: HistoricaQuery[] = []
	// console.log(blockConfig.query)

	if (!blockConfig.query) {
		query = []
	} else if (Object.keys(blockConfig.query).length === 0) {
		query = []

	} else if (Object.keys(blockConfig.query).length >= 0) {
		const keys = Object.keys(blockConfig.query)
		keys.map((key) => {
			//@ts-ignore
			if (!blockConfig.query[key].start && !typeof blockConfig.query[key].start === "string") {
				new Notice(`Your query is not valid, please check your query at ${key}`)
			}
			//@ts-ignore
			if (blockConfig.query[key].end && !typeof blockConfig.query[key].start === "string") {
				new Notice(`Your query is not valid, please check your query at ${key}`)
			}
			query.push({
				// @ts-ignore
				start: blockConfig.query[key].start,
				// @ts-ignore
				end: blockConfig.query[key].end
			})
		})

	} else if (!Array.isArray(blockConfig.query)) {
		query = [blockConfig.query]
	} else if (Array.isArray(blockConfig.query) && blockConfig.query[0].start) {
		query = blockConfig.query
	} else {
		query = []
		new Notice("Your query is not valid, please check your query")
	}
	blockConfig.query = query


	// PIN_TIME
	// default pin time if pin time not setup
	if (!blockConfig.pin_time || blockConfig.pin_time && blockConfig.pin_time.trim() === "") {
		blockConfig.pin_time = "now"
	}

	// SMART_THEME
	if (!blockConfig.smart_theme ) {
		blockConfig.smart_theme = thisPlugin.settingManager.settings.usingSmartTheme
	}

	// IMPLICIT_TIME
	// console.log(blockConfig.implicit_time)
	if (![true,false].includes(blockConfig.implicit_time) ) {
		blockConfig.implicit_time = thisPlugin.settingManager.settings.showRelativeTime
	}

	return blockConfig
}
