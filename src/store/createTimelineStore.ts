import {createStore, type StoreApi} from "zustand/vanilla";
import {temporal} from "zundo";
import {MarkdownPostProcessorContext, Notice, TFile} from "obsidian";
import {moment} from "../moment-fix";
import HistoricaPlugin from "@/main";
import {TimelineDocument, HistoricaSettings, TimelineEntry} from "@/src/types";
import {generateRandomId, UpdateBlockSetting} from "@/src/utils";
import TimelineDataManager, {dataFilePath} from "@/src/data/TimelineDataManager";
import MarkdownProcessor from "@/src/compute/MarkdownParser";

interface TimelineState {
	units: TimelineEntry[];
	settings: HistoricaSettings;
	isLoading: boolean;
	isParsing: boolean;
	error: string | null;
	showHidden: boolean;
	sigFilter: number;
	isDirty: boolean;
	isSaving: boolean;
	loaded: boolean;
	lastAction: "undo" | "redo" | null;
}

interface TimelineActions {
	load(): Promise<void>;
	manualSave(): Promise<void>;
	addUnit(index: number): Promise<void>;
	removeUnit(id: string): void;
	editUnit(id: string, updatedUnit: TimelineEntry): void;
	moveUnit(index: number, direction: "up" | "down"): void;
	reorderUnit(fromIndex: number, toIndex: number): void;
	sort(order: "asc" | "desc"): void;
	expandUnit(entry: TimelineEntry, isExpanded: boolean): void;
	expandAll(willExpand: boolean): void;
	hideUnit(id: string, isHidden: boolean): void;
	toggleShowHidden(): void;
	setSigFilter(n: number): void;
	removeAll(): void;
	updateSettings(partial: Partial<HistoricaSettings>): void;
	editHeaderOrFooter(content: string, type: "header" | "footer"): void;
	parseFromFile(path: string, autoTriggered?: boolean): Promise<void>;
	importFromTimeline(path: string): Promise<void>;
	toggleAutoSave(): void;
	undo(): void;
	redo(): void;
}

export type TimelineStore = TimelineState & TimelineActions;

export interface TimelineStoreHandle {
	store: StoreApi<TimelineStore>;
	destroy: () => void;
}

function setupAutoSave(
	store: StoreApi<TimelineStore>,
	buildSaveData: () => TimelineDocument,
	dataManager: TimelineDataManager,
): () => void {
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	const unsubscribe = store.subscribe((state, prev) => {
		if (!state.loaded) return;
		if (!prev.loaded) return; // skip the initial load → don't auto-save data just loaded from disk
		if (state.lastAction === "undo" || state.lastAction === "redo") return; // undo/redo ≠ save intent
		if (state.units !== prev.units || state.settings !== prev.settings) {
			store.setState({isDirty: true});
			if (state.settings.autoSave && state.settings.blockId !== "-1" && state.units.length > 0) {
				if (saveTimeout) clearTimeout(saveTimeout);
				saveTimeout = setTimeout(() => {
					store.setState({isSaving: true});
					dataManager.save(buildSaveData())
						.then(() => store.setState({isDirty: false, isSaving: false}))
						.catch((e) => { console.error(e); store.setState({isSaving: false}); });
				}, 500);
			}
		}
	});

	return () => {
		if (saveTimeout) clearTimeout(saveTimeout);
		unsubscribe();
	};
}

export function createTimelineStore(
	plugin: HistoricaPlugin,
	initialSettings: HistoricaSettings,
	ctx?: MarkdownPostProcessorContext,
): TimelineStoreHandle {
	const dataManager = new TimelineDataManager(plugin);

	const ensureBlockId = async () => {
		const {settings} = store.getState();
		if (!ctx) return settings;  // sidebar: blockId already known, skip fence write
		const updated = await dataManager.ensureBlockId(settings, ctx);
		if (updated !== settings) store.setState({settings: updated});
		return updated;
	};

	const buildSaveData = (): TimelineDocument => {
		const {settings, units} = store.getState();
		return {settings, units};
	};

	const store = createStore<TimelineStore>()(temporal((set, get) => ({
		units: [],
		settings: {...structuredClone(initialSettings), autoSave: initialSettings.autoSave ?? true},
		isLoading: true,
		isParsing: false,
		error: null,
		showHidden: false,
		sigFilter: 1,
		isDirty: false,
		isSaving: false,
		loaded: false,
		lastAction: null,

		async load() {
			try {
				const {settings} = get();
				if (settings.blockId !== "-1") {
					const data = await dataManager.load(settings.blockId);
					if (data) {
						set({
							units: data.units,
							settings: {...data.settings, autoSave: data.settings.autoSave ?? true},
							isLoading: false,
							loaded: true,
						});
						return;
					}
				}
				set({isLoading: false, loaded: true});
			} catch (e) {
				set({error: (e as Error).message, isLoading: false, loaded: true});
			}
		},

		async manualSave() {
			set({isSaving: true});
			try {
				await ensureBlockId();
				await dataManager.save(buildSaveData());
				const {settings} = get();
				set({isDirty: false, isSaving: false});
				new Notice(`Timeline saved to ${dataFilePath(settings.blockId)}`, 10000);
			} catch (e) {
				set({isSaving: false});
				throw e;
			}
		},

		async addUnit(index: number) {
			await ensureBlockId();
			const {units} = get();
			const newUnit: TimelineEntry = {
				attachments: [],
				parsedResultText: "title",
				time: {value: moment().unix().toString(), style: "unix"},
				sentence: "main content",
				filePath: "",
				id: generateRandomId(),
				isExpanded: true,
				nodePos: {start: {line: 1, column: 1}, end: {line: 1, column: 1}},
			};
			const before = units.slice(0, index);
			const after = units.slice(index);
			set({units: [...before, newUnit, ...after]});
		},

		removeUnit(id: string) {
			set({units: get().units.filter(u => u.id !== id)});
		},

		editUnit(id: string, updated: TimelineEntry) {
			set({units: get().units.map(u => u.id === id ? updated : u)});
		},

		moveUnit(index: number, direction: "up" | "down") {
			const units = [...get().units];
			if (direction === "up" && index > 0) {
				[units[index], units[index - 1]] = [units[index - 1], units[index]];
			} else if (direction === "down" && index < units.length - 1) {
				[units[index], units[index + 1]] = [units[index + 1], units[index]];
			}
			set({units});
		},

		reorderUnit(fromIndex: number, toIndex: number) {
			if (fromIndex === toIndex) return;
			const units = [...get().units];
			const [moved] = units.splice(fromIndex, 1);
			units.splice(toIndex, 0, moved);
			set({ units });
		},

		sort(order: "asc" | "desc") {
			const {units} = get();
			const unixUnits = units.filter(u => u.time.style === "unix");
			const sorted = unixUnits.sort((a, b) => {
				const timeA = parseInt(a.time.value, 10);
				const timeB = parseInt(b.time.value, 10);
				return order === "asc" ? timeA - timeB : timeB - timeA;
			});
			const nonUnix = units.filter(u => u.time.style !== "unix");
			set({units: [...sorted, ...nonUnix]});
		},

		expandUnit(entry: TimelineEntry, isExpanded: boolean) {
			const units = get().units;
			if (units.some(u => u.id === entry.id)) {
				set({units: units.map(u => u.id === entry.id ? {...u, isExpanded} : u)});
			} else {
				// Entry not in units (e.g. a big history anchor) — add it so state persists
				set({units: [...units, {...entry, isExpanded}]});
			}
		},

		expandAll(willExpand: boolean) {
			set({units: get().units.map(u => ({...u, isExpanded: willExpand}))});
		},

		hideUnit(id: string, isHidden: boolean) {
			set({units: get().units.map(u => u.id === id ? {...u, isHidden} : u)});
		},

		toggleShowHidden() {
			set({showHidden: !get().showHidden});
		},

		setSigFilter(n: number) {
			set({sigFilter: n});
		},

		removeAll() {
			set({units: []});
		},

		updateSettings(partial: Partial<HistoricaSettings>) {
			set({settings: {...get().settings, ...partial}});
		},

		editHeaderOrFooter(content: string, type: "header" | "footer") {
			const {settings} = get();
			if (type === "header") set({settings: {...settings, header: content}});
			else set({settings: {...settings, footer: content}});
		},

		async parseFromFile(path: string, autoTriggered = false) {
			const file = plugin.app.vault.getAbstractFileByPath(path);
			if (!(file instanceof TFile)) return;

			set({isParsing: true});
			try {
				const {settings} = get();
				const parser = new MarkdownProcessor(plugin, settings);
				// Use section-scoped parse when the block has a known ID.
				// Falls back to full-file automatically when no heading exists above the block.
				const nodes = settings.blockId !== "-1"
					? await parser.parseFilesAndGetNodeDataForSection(file, settings.blockId)
					: await parser.parseFilesAndGetNodeData(file);
				const sentences = await parser.extractValidSentencesFromFile(file, nodes);
				const parsed = await parser.getPlotUnits(sentences);

				if (parsed.length === 0) {
					if (!autoTriggered) new Notice("No dates found in this file", 5000);
					return;
				}

				// Re-fetch units after async parse so we don't merge against a stale snapshot.
				const {units} = get();
				const existingById = new Map(units.map(u => [u.id, u]));
				const merged = parsed.map(entry => {
					const old = existingById.get(entry.id);
					if (!old) return entry;
					// Preserve user-owned fields; parser-owned fields come from fresh parse.
					return {
						...entry,
						annotation: old.annotation,
						isHidden: old.isHidden,
						attachments: old.attachments,
					};
				});

				if (autoTriggered) {
					// Only notify when the entry count changes — re-parse with same content is silent.
					if (merged.length !== units.length) {
						const delta = merged.length - units.length;
						const sign = delta > 0 ? "+" : "";
						new Notice(`Timeline updated: ${merged.length} entries (${sign}${delta})`, 3000);
					}
				} else {
					new Notice(`Parsed ${parsed.length} entries from file`, 5000);
				}

				// Assign blockId in memory first (before writing to markdown)
				const isNewBlock = settings.blockId === "-1";
				const finalSettings = isNewBlock
					? {...settings, blockId: generateRandomId()}
					: settings;
				set({units: merged, settings: finalSettings});

				// Save data BEFORE writing blockId to markdown.
				// Writing blockId triggers Obsidian to re-render the block (new store + load()).
				// Data must be on disk before that happens, otherwise load() finds nothing.
				await dataManager.save(buildSaveData());
				set({isDirty: false});

				if (isNewBlock && ctx) {
					await UpdateBlockSetting(finalSettings, ctx, plugin);
					new Notice(`Timeline saved with ID ${finalSettings.blockId}`, 5000);
				}
			} finally {
				set({isParsing: false});
			}
		},

		async importFromTimeline(path: string) {
			const {units} = get();
			await ensureBlockId();
			const data = await dataManager.importFromFile(path);
			if (data) {
				set({units: [...units, ...data.units]});
			}
		},

		toggleAutoSave() {
			const {settings} = get();
			const newAutoSave = !settings.autoSave;
			set({settings: {...settings, autoSave: newAutoSave}});
			if (settings.blockId !== "-1") {
				dataManager.save(buildSaveData())
					.catch((e) => console.error("Failed to persist autoSave preference:", e));
			}
		},

		undo() {
			const { pastStates } = store.temporal.getState();
			if (pastStates.length === 0) return;
			set({lastAction: "undo"});
			store.temporal.getState().undo();
			set({lastAction: null});
			new Notice(`Undone (${pastStates.length - 1} left)`, 1500);
		},

		redo() {
			const { futureStates } = store.temporal.getState();
			if (futureStates.length === 0) return;
			set({lastAction: "redo"});
			store.temporal.getState().redo();
			set({lastAction: null});
			new Notice(`Redone (${futureStates.length - 1} left)`, 1500);
		},
	}), {
		partialize: (state) => ({ units: state.units }),
		limit: 50,
	}));

	const destroy = setupAutoSave(store, buildSaveData, dataManager);

	return {store, destroy};
}
