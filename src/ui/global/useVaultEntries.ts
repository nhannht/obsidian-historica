import { useState, useEffect } from "react";
import { TFile } from "obsidian";
import type HistoricaPlugin from "@/main";
import { parseHmd } from "@/src/data/HmdParser";
import { dataFilePath } from "@/src/data/TimelineDataManager";
import { TimeData } from "@/src/types";

export type GlobalEntry = {
	id: string;
	blockId: string;
	notePath: string;
	noteTitle: string;
	sentence: string;
	parsedResultText: string;
	time: TimeData;
	unixTime: number | null;
	year: number | null;
};

export function toUnix(time: TimeData): number | null {
	if (time.style !== "unix") return null;
	const n = parseInt(time.value, 10);
	return isNaN(n) ? null : n;
}

export function useVaultEntries(plugin: HistoricaPlugin) {
	const [entries, setEntries] = useState<GlobalEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			setLoading(true);
			const index = plugin.vaultIndex.getIndex();

			const blockEntries = await Promise.all(
				Object.entries(index).map(async ([blockId, meta]) => {
					const filePath = dataFilePath(blockId, plugin.dataDir);
					const file = plugin.app.vault.getAbstractFileByPath(filePath);
					if (!(file instanceof TFile)) return [];
					try {
						const content = await plugin.app.vault.read(file);
						const data = parseHmd(content);
						if (!data) return [];
						return data.units
							.filter(u => !u.isHidden)
							.map(unit => {
								const unixTime = toUnix(unit.time);
								const d = unixTime !== null ? new Date(unixTime) : null;
								const year = d && !isNaN(d.getTime()) ? d.getFullYear() : null;
								return {
									id: `${blockId}:${unit.id}`,
									blockId,
									notePath: meta.notePath,
									noteTitle: meta.noteTitle,
									sentence: unit.sentence,
									parsedResultText: unit.parsedResultText,
									time: unit.time,
									unixTime,
									year,
								} satisfies GlobalEntry;
							});
					} catch {
						return [];
					}
				})
			);

			const result = blockEntries.flat();

			// unix entries sorted chronologically, free-form text entries at end
			result.sort((a, b) => {
				if (a.unixTime !== null && b.unixTime !== null) return a.unixTime - b.unixTime;
				if (a.unixTime !== null) return -1;
				if (b.unixTime !== null) return 1;
				return 0;
			});

			if (!cancelled) {
				setEntries(result);
				setLoading(false);
			}
		}

		load().catch(console.error);
		return () => { cancelled = true; };
	}, [plugin]);

	return { entries, loading };
}
