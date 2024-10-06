import {TFile} from "obsidian";
import {isNull} from "lodash"
import HistoricaPlugin from "../../main";

import {HistoricaSetting} from "../global";




export default class HistoricaFileHelper {
	get plugin(): HistoricaPlugin {
		return this._plugin;
	}

	set plugin(value: HistoricaPlugin) {
		this._plugin = value;
	}

	private _plugin: HistoricaPlugin;

	constructor(plugin: HistoricaPlugin) {
		this._plugin = plugin;
	}

	async getCurrentFile(): Promise<TFile> {
		let currentFile: TFile | null = this.plugin.app.workspace.getActiveFile();
		//@ts-ignore
		if (currentFile instanceof TFile) {

		} else {


			let data: HistoricaSetting = await this.plugin.loadData()

			if (data.latestFile) {

				const currentFileAbstract = this.plugin.app.vault.getAbstractFileByPath(data.latestFile)
				if (currentFileAbstract instanceof TFile) {
					currentFile = currentFileAbstract
				}
			}

		}
		if (!isNull(currentFile)) {
			return currentFile
		} else {
			return new TFile()
		}
	}




}
