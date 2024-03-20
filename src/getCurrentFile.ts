import {Plugin, TFile} from "obsidian";
import {HistoricaSetting} from "./historicaSettingTab";

/**
 * get the current file. if the current file is not a TFile, get the latest file from plugin data.Why this function exist, because most time the plugin load faster than the buffer when fist start Obsidian, so getActiveFile - standard way to get current file in obsidian still not being loaded
 * @param currentPlugin
 */
export async function getCurrentFile(currentPlugin: Plugin): Promise<TFile> {
	let currentFile: TFile | null = currentPlugin.app.workspace.getActiveFile();
	//@ts-ignore
	if (currentFile instanceof TFile) {

	} else {


		let data: HistoricaSetting = await currentPlugin.loadData()

		if (data.latestFile) {

			const currentFileAbstract = currentPlugin.app.vault.getAbstractFileByPath(data.latestFile)
			if (currentFileAbstract instanceof TFile) {
				currentFile = currentFileAbstract
			}
		}

	}
	// @ts-ignore
	return currentFile

}
