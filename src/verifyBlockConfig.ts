import HistoricaPlugin from "../main";
import {Notice} from "obsidian"


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


	// default pin time if pin time not setup
	if (!blockConfig.pin_time || blockConfig.pin_time && blockConfig.pin_time.trim() === "") {
		blockConfig.pin_time = "now"
	}


	return blockConfig
}
