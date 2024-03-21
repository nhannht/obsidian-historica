import {Plugin, TFile} from "obsidian";

import {HistoricaSetting} from "./historicaSettingTab";



/**
 * write the latest file to data. in case data never exist before, create a new data object
 * @param currentPlugin
 * @param file
 */
export async function writeLatestFileToData(currentPlugin: Plugin, file: TFile) {
	let settings: HistoricaSetting = await currentPlugin.loadData()

	if (!settings) {
		settings = {
			latestFile: file.path,
			showUseFulInformation: false,
			defaultStyle: "1",
			showRelativeTime: false,
			usingSmartTheme: true

		}

	}
	settings.latestFile = file.path
	await currentPlugin.saveData(settings)

}
