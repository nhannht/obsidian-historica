import {MarkdownPostProcessorContext, Notice, TFile, TFolder} from "obsidian";
import HistoricaPlugin from "@/main";
import {HistoricaFileData, HistoricaSettingNg} from "@/src/types";
import {GenerateRandomId, UpdateBlockSetting} from "@/src/utils";


export function dataFilePath(blockId: string): string {
	return `historica-data/${blockId}.json`;
}

export default class TimelineDataManager {
	constructor(private plugin: HistoricaPlugin) {}

	async load(blockId: string): Promise<HistoricaFileData | null> {
		if (blockId === "-1") return null;
		const filePath = dataFilePath(blockId);
		const file = this.plugin.app.vault.getAbstractFileByPath(filePath);
		if (!(file instanceof TFile)) return null;

		try {
			const content = await this.plugin.app.vault.read(file);
			const data: HistoricaFileData = JSON.parse(content);
			if (data && data.settings && data.units) return data;
			return null;
		} catch {
			return null;
		}
	}

	async save(data: HistoricaFileData): Promise<void> {
		const blockId = data.settings.blockId;
		if (blockId === "-1") return;

		const filePath = dataFilePath(blockId);
		const json = JSON.stringify(data, null, 2);

		try {
			const existing = this.plugin.app.vault.getAbstractFileByPath(filePath);
			if (existing instanceof TFile) {
				await this.plugin.app.vault.modify(existing, json);
			} else {
				await this.ensureDataDir();
				await this.plugin.app.vault.create(filePath, json);
			}
		} catch {
			// Retry once — race between check and write
			await this.ensureDataDir();
			try {
				await this.plugin.app.vault.create(filePath, json);
			} catch {
				const file = this.plugin.app.vault.getAbstractFileByPath(filePath);
				if (file instanceof TFile) await this.plugin.app.vault.modify(file, json);
			}
		}
	}

	async ensureBlockId(
		settings: HistoricaSettingNg,
		ctx: MarkdownPostProcessorContext
	): Promise<HistoricaSettingNg> {
		if (settings.blockId !== "-1") return settings;

		const blockId = GenerateRandomId();
		const updated = {...settings, blockId};
		await UpdateBlockSetting(updated, ctx, this.plugin);
		new Notice(`Timeline saved with ID ${blockId}`, 5000);
		return updated;
	}

	async importFromFile(path: string): Promise<HistoricaFileData | null> {
		const file = this.plugin.app.vault.getAbstractFileByPath(path);
		if (!(file instanceof TFile)) {
			new Notice(`File ${path} does not exist or is not a file`, 10000);
			return null;
		}

		try {
			const content = await this.plugin.app.vault.read(file);
			const data: HistoricaFileData = JSON.parse(content);
			if (data && data.units && data.units.length > 0) {
				new Notice(`Imported ${data.units.length} units from ${path}`, 10000);
				return data;
			} else if (data && data.units && data.units.length === 0) {
				new Notice("No units stored in this file", 10000);
				return null;
			} else {
				new Notice("JSON file is corrupted, cannot import", 10000);
				return null;
			}
		} catch {
			new Notice("Failed to parse JSON file", 10000);
			return null;
		}
	}

	private async ensureDataDir(): Promise<void> {
		const dir = this.plugin.app.vault.getAbstractFileByPath("historica-data");
		if (!dir || !(dir instanceof TFolder)) {
			await this.plugin.app.vault.createFolder("historica-data");
		}
	}
}
