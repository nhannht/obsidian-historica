import {Plugin, TFile} from "obsidian";

export interface HistoricaSetting {
	latestFile: string
	showUseFulInformation: boolean
	defaultStyle: string
}

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
			showUseFulInformation: true,
			defaultStyle: "1"
		}

	}
	settings.latestFile = file.path
	await currentPlugin.saveData(settings)

}
