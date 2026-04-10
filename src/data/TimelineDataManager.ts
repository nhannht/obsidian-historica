import {MarkdownPostProcessorContext, Notice, TFile, TFolder} from "obsidian";
import HistoricaPlugin from "@/main";
import {TimelineDocument, HistoricaSettings} from "@/src/types";
import {GenerateRandomId, UpdateBlockSetting} from "@/src/utils";
import {parseHmd, serializeHmd, HmdParseResult} from "./HmdParser";

export const HISTORICA_DATA_DIR = "historica-data";

export function dataFilePath(blockId: string): string {
	return `${HISTORICA_DATA_DIR}/${blockId}.md`;
}

function jsonDataFilePath(blockId: string): string {
	return `${HISTORICA_DATA_DIR}/${blockId}.json`;
}

export default class TimelineDataManager {
	constructor(private plugin: HistoricaPlugin) {}

	async load(blockId: string): Promise<TimelineDocument | null> {
		if (blockId === "-1") return null;

		// Try HMD (.md) first
		const mdPath = dataFilePath(blockId);
		const mdFile = this.plugin.app.vault.getAbstractFileByPath(mdPath);
		if (mdFile instanceof TFile) {
			try {
				const content = await this.plugin.app.vault.read(mdFile);
				const data = parseHmd(content);
				if (data && data.settings && data.units) return data;
			} catch {
				// Fall through to JSON fallback
			}
		}

		// Fallback: migrate legacy JSON → HMD
		const jsonPath = jsonDataFilePath(blockId);
		const jsonFile = this.plugin.app.vault.getAbstractFileByPath(jsonPath);
		if (jsonFile instanceof TFile) {
			try {
				const content = await this.plugin.app.vault.read(jsonFile);
				const data: TimelineDocument = JSON.parse(content);
				if (data && data.settings && data.units) {
					// Migrate: write HMD, delete JSON
					const hmd = serializeHmd(data as HmdParseResult);
					await this.plugin.app.vault.create(mdPath, hmd);
					await this.plugin.app.vault.delete(jsonFile);
					new Notice(`Migrated timeline ${blockId} from JSON to HMD`, 5000);
					return data;
				}
			} catch {
				return null;
			}
		}

		return null;
	}

	async save(data: TimelineDocument): Promise<void> {
		const blockId = data.settings.blockId;
		if (blockId === "-1") return;

		const filePath = dataFilePath(blockId);
		const hmd = serializeHmd(data as HmdParseResult);

		try {
			const existing = this.plugin.app.vault.getAbstractFileByPath(filePath);
			if (existing instanceof TFile) {
				await this.plugin.app.vault.modify(existing, hmd);
			} else {
				await this.ensureDataDir();
				await this.plugin.app.vault.create(filePath, hmd);
			}
		} catch {
			// Retry once — race between check and write
			await this.ensureDataDir();
			try {
				await this.plugin.app.vault.create(filePath, hmd);
			} catch {
				const file = this.plugin.app.vault.getAbstractFileByPath(filePath);
				if (file instanceof TFile) await this.plugin.app.vault.modify(file, hmd);
			}
		}
	}

	async ensureBlockId(
		settings: HistoricaSettings,
		ctx: MarkdownPostProcessorContext
	): Promise<HistoricaSettings> {
		if (settings.blockId !== "-1") return settings;

		const blockId = GenerateRandomId();
		const updated = {...settings, blockId};
		await UpdateBlockSetting(updated, ctx, this.plugin);
		new Notice(`Timeline saved with ID ${blockId}`, 5000);
		return updated;
	}

	async importFromFile(path: string): Promise<TimelineDocument | null> {
		const file = this.plugin.app.vault.getAbstractFileByPath(path);
		if (!(file instanceof TFile)) {
			new Notice(`File ${path} does not exist or is not a file`, 10000);
			return null;
		}

		try {
			const content = await this.plugin.app.vault.read(file);
			let data: TimelineDocument;

			if (path.endsWith(".md")) {
				data = parseHmd(content);
			} else {
				data = JSON.parse(content);
			}

			if (data && data.units && data.units.length > 0) {
				new Notice(`Imported ${data.units.length} units from ${path}`, 10000);
				return data;
			} else if (data && data.units && data.units.length === 0) {
				new Notice("No units stored in this file", 10000);
				return null;
			} else {
				new Notice("File is corrupted, cannot import", 10000);
				return null;
			}
		} catch {
			new Notice("Failed to parse file", 10000);
			return null;
		}
	}

	private async ensureDataDir(): Promise<void> {
		const dir = this.plugin.app.vault.getAbstractFileByPath(HISTORICA_DATA_DIR);
		if (!dir || !(dir instanceof TFolder)) {
			await this.plugin.app.vault.createFolder(HISTORICA_DATA_DIR);
		}
	}
}
