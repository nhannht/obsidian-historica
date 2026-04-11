import {createStore, type StoreApi} from "zustand/vanilla";
import {MarkdownPostProcessorContext, Notice, TFile} from "obsidian";
import {moment} from "../moment-fix";
import HistoricaPlugin from "@/main";
import {TimelineDocument, HistoricaSettings, TimelineEntry} from "@/src/types";
import {generateRandomId} from "@/src/utils";
import TimelineDataManager, {dataFilePath} from "@/src/data/TimelineDataManager";
import MarkdownProcessor from "@/src/compute/MarkdownParser";

interface TimelineState {
	units: TimelineEntry[];
	settings: HistoricaSettings;
	isLoading: boolean;
	error: string | null;
	showHidden: boolean;
	isDirty: boolean;
	isSaving: boolean;
	loaded: boolean;
}

interface TimelineActions {
	load(): Promise<void>;
	manualSave(): Promise<void>;
	addUnit(index: number): Promise<void>;
	removeUnit(id: string): void;
	editUnit(id: string, updatedUnit: TimelineEntry): void;
	moveUnit(index: number, direction: "up" | "down"): void;
	sort(order: "asc" | "desc"): void;
	expandUnit(id: string, isExpanded: boolean): void;
	expandAll(willExpand: boolean): void;
	hideUnit(id: string, isHidden: boolean): void;
	toggleShowHidden(): void;
	removeAll(): void;
	updateSettings(partial: Partial<HistoricaSettings>): void;
	editHeaderOrFooter(content: string, type: "header" | "footer"): void;
	parseFromFile(path: string): Promise<void>;
	importFromTimeline(path: string): Promise<void>;
	toggleAutoSave(): void;
}

export type TimelineStore = TimelineState & TimelineActions;

export interface TimelineStoreHandle {
	store: StoreApi<TimelineStore>;
	destroy: () => void;
}

export function createTimelineStore(
	plugin: HistoricaPlugin,
	initialSettings: HistoricaSettings,
	ctx: MarkdownPostProcessorContext,
): TimelineStoreHandle {
	const dataManager = new TimelineDataManager(plugin);

	const ensureBlockId = async () => {
		const {settings} = store.getState();
		const updated = await dataManager.ensureBlockId(settings, ctx);
		if (updated !== settings) store.setState({settings: updated});
		return updated;
	};

	const buildSaveData = (): TimelineDocument => {
		const {settings, units} = store.getState();
		return {settings, units};
	};

	const store = createStore<TimelineStore>((set, get) => ({
		units: [],
		settings: {...structuredClone(initialSettings), autoSave: initialSettings.autoSave ?? true},
		isLoading: true,
		error: null,
		showHidden: false,
		isDirty: false,
		isSaving: false,
		loaded: false,

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

		expandUnit(id: string, isExpanded: boolean) {
			set({units: get().units.map(u => u.id === id ? {...u, isExpanded} : u)});
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

		async parseFromFile(path: string) {
			const {units} = get();
			const file = plugin.app.vault.getAbstractFileByPath(path);
			if (!(file instanceof TFile)) return;

			const updated = await ensureBlockId();
			const parser = new MarkdownProcessor(plugin, updated);
			const nodes = await parser.parseFilesAndGetNodeData(file);
			const sentences = await parser.extractValidSentencesFromFile(file, nodes);
			const parsed = await parser.getPlotUnits(sentences);

			if (parsed.length === 0) {
				new Notice("No dates found in this file", 10000);
			} else {
				new Notice(`Parsed ${parsed.length} units from file`, 10000);
			}
			set({units: [...parsed, ...units]});
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
	}));

	// Auto-save with debounce
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	const unsubscribe = store.subscribe((state, prev) => {
		if (!state.loaded) return;
		if (!prev.loaded) return; // skip the initial load → don't auto-save data just loaded from disk
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

	const destroy = () => {
		if (saveTimeout) clearTimeout(saveTimeout);
		unsubscribe();
	};

	return {store, destroy};
}
