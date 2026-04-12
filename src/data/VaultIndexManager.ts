import { TFile, TFolder } from "obsidian";
import type HistoricaPlugin from "@/main";
import { parseHmd } from "./HmdParser";
import { notePathToTitle } from "@/src/utils";

export type VaultIndexEntry = {
	notePath: string;
	noteTitle: string;
	lastModified: number;
	entryCount: number;
};

export type VaultIndex = Record<string, VaultIndexEntry>;

export class VaultIndexManager {
	private index: VaultIndex = {};
	private persistTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(private plugin: HistoricaPlugin) {}

	private get dataDir(): string {
		return this.plugin.dataDir;
	}

	private get indexPath(): string {
		return `${this.dataDir}/_index.json`;
	}

	async buildFull(): Promise<void> {
		const dir = this.plugin.app.vault.getAbstractFileByPath(this.dataDir);
		if (!dir || !(dir instanceof TFolder)) {
			this.index = {};
			return;
		}

		const files = dir.children.filter(
			(c): c is TFile => c instanceof TFile && c.extension === "md"
		);

		const pairs = await Promise.all(files.map(async (child) => {
			try {
				const content = await this.plugin.app.vault.read(child);
				const data = parseHmd(content);
				if (!data) return null;
				const notePath = data.units[0]?.filePath ?? "";
				return [child.basename, {
					notePath,
					noteTitle: notePathToTitle(notePath),
					lastModified: child.stat.mtime,
					entryCount: data.units.length,
				}] as const;
			} catch {
				return null;
			}
		}));

		const newIndex: VaultIndex = {};
		for (const pair of pairs) if (pair) newIndex[pair[0]] = pair[1];
		this.index = newIndex;
		await this.persist();
	}

	updateEntry(blockId: string, notePath: string, entryCount: number): void {
		this.index[blockId] = {
			notePath,
			noteTitle: notePathToTitle(notePath),
			lastModified: Date.now(),
			entryCount,
		};
		this.schedulePersist();
	}

	getIndex(): VaultIndex {
		return this.index;
	}

	private schedulePersist(): void {
		if (this.persistTimer) clearTimeout(this.persistTimer);
		this.persistTimer = setTimeout(() => {
			this.persistTimer = null;
			this.persist().catch((e: unknown) =>
				console.error("[historica] Failed to persist vault index:", e)
			);
		}, 300);
	}

	private async persist(): Promise<void> {
		const content = JSON.stringify(this.index, null, 2);
		const existing = this.plugin.app.vault.getAbstractFileByPath(this.indexPath);
		if (existing instanceof TFile) {
			await this.plugin.app.vault.modify(existing, content);
		} else {
			await this.ensureDataDir();
			try {
				await this.plugin.app.vault.create(this.indexPath, content);
			} catch {
				// race: another write created the file between our existence check and create
				const file = this.plugin.app.vault.getAbstractFileByPath(this.indexPath);
				if (file instanceof TFile) await this.plugin.app.vault.modify(file, content);
			}
		}
	}

	private async ensureDataDir(): Promise<void> {
		const dir = this.plugin.app.vault.getAbstractFileByPath(this.dataDir);
		if (!dir || !(dir instanceof TFolder)) {
			await this.plugin.app.vault.createFolder(this.dataDir);
		}
	}
}
