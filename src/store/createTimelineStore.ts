import {createStore} from "zustand/vanilla";
import {MarkdownPostProcessorContext, Notice, TFile} from "obsidian";
import {moment} from "../moment-fix";
import HistoricaPlugin from "@/main";
import {HistoricaFileData, HistoricaSettingNg, PlotUnitNg} from "@/src/types";
import {GenerateRandomId} from "@/src/utils";
import TimelineDataManager from "@/src/data/TimelineDataManager";
import MarkdownProcesser from "@/src/compute/MarkdownParser";

export interface TimelineState {
	units: PlotUnitNg[];
	settings: HistoricaSettingNg;
	isLoading: boolean;
	error: string | null;
	showHidden: boolean;
	isDirty: boolean;
	isSaving: boolean;
}

export interface TimelineActions {
	load(): Promise<void>;
	manualSave(): Promise<void>;
	addUnit(index: number): void;
	removeUnit(id: string): void;
	editUnit(id: string, updated: PlotUnitNg): void;
	moveUnit(index: number, direction: string): void;
	sort(order: "asc" | "desc"): void;
	expandUnit(id: string, isExpanded: boolean): void;
	expandAll(willExpand: boolean): void;
	hideUnit(id: string, isHidden: boolean): void;
	toggleShowHidden(): void;
	removeAll(): void;
	updateSettings(partial: Partial<HistoricaSettingNg>): void;
	editHeaderOrFooter(content: string, type: string): void;
	parseFromFile(path: string): Promise<void>;
	importFromTimeline(path: string): Promise<void>;
}

export type TimelineStore = TimelineState & TimelineActions;

export function createTimelineStore(
	plugin: HistoricaPlugin,
	initialSettings: HistoricaSettingNg,
	ctx: MarkdownPostProcessorContext,
) {
	const dataManager = new TimelineDataManager(plugin);

	const store = createStore<TimelineStore>((set, get) => ({
		units: [],
		settings: structuredClone(initialSettings),
		isLoading: true,
		error: null,
		showHidden: false,
		isDirty: false,
		isSaving: false,

		async load() {
			try {
				const {settings} = get();
				if (settings.blockId !== "-1") {
					const data = await dataManager.load(settings.blockId);
					if (data) {
						set({units: data.units, settings: data.settings, isLoading: false});
						return;
					}
				}

				// No saved data — parse current file
				const currentFile = plugin.app.workspace.getActiveFile();
				if (currentFile instanceof TFile) {
					const parser = new MarkdownProcesser(plugin, settings);
					const nodes = await parser.ParseFilesAndGetNodeData(currentFile);
					const sentences = await parser.ExtractValidSentencesFromFile(currentFile, nodes);
					const units = await parser.GetPlotUnits(sentences);
					set({units, isLoading: false});
				} else {
					set({isLoading: false});
				}
			} catch (e) {
				set({error: (e as Error).message, isLoading: false});
			}
		},

		async manualSave() {
			set({isSaving: true});
			try {
				const {settings, units} = get();
				const updated = await dataManager.ensureBlockId(settings, ctx);
				const data: HistoricaFileData = {settings: updated, units};
				await dataManager.save(data);
				set({settings: updated, isDirty: false, isSaving: false});
				new Notice(`Timeline saved to historica-data/${updated.blockId}.json`, 10000);
			} catch (e) {
				set({isSaving: false});
				throw e;
			}
		},

		addUnit(index: number) {
			const {units} = get();
			const newUnit: PlotUnitNg = {
				attachments: [],
				parsedResultText: "title",
				time: {value: moment().unix().toString(), style: "unix"},
				sentence: "main content",
				filePath: "",
				id: GenerateRandomId(),
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

		editUnit(id: string, updated: PlotUnitNg) {
			set({units: get().units.map(u => u.id === id ? updated : u)});
		},

		moveUnit(index: number, direction: string) {
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

		updateSettings(partial: Partial<HistoricaSettingNg>) {
			set({settings: {...get().settings, ...partial}});
		},

		editHeaderOrFooter(content: string, type: string) {
			const {settings} = get();
			if (type === "header") set({settings: {...settings, header: content}});
			else set({settings: {...settings, footer: content}});
		},

		async parseFromFile(path: string) {
			const {units, settings} = get();
			const file = plugin.app.vault.getAbstractFileByPath(path);
			if (!(file instanceof TFile)) return;

			const parser = new MarkdownProcesser(plugin, settings);
			const nodes = await parser.ParseFilesAndGetNodeData(file);
			const sentences = await parser.ExtractValidSentencesFromFile(file, nodes);
			const parsed = await parser.GetPlotUnits(sentences);

			if (parsed.length === 0) {
				new Notice("No dates found in this file", 10000);
			} else {
				new Notice(`Parsed ${parsed.length} units from file`, 10000);
			}
			set({units: [...parsed, ...units]});
		},

		async importFromTimeline(path: string) {
			const {units} = get();
			const data = await dataManager.importFromFile(path);
			if (data) {
				set({units: [...units, ...data.units]});
			}
		},
	}));

	// Auto-save with debounce: persist to vault on meaningful state changes
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let loaded = false;

	const unsubscribe = store.subscribe((state, prev) => {
		if (!loaded) return;
		if (state.units !== prev.units || state.settings !== prev.settings) {
			store.setState({isDirty: true});
			if (state.settings.blockId !== "-1" && state.units.length > 0) {
				if (saveTimeout) clearTimeout(saveTimeout);
				saveTimeout = setTimeout(() => {
					const current = store.getState();
					store.setState({isSaving: true});
					const data: HistoricaFileData = {settings: current.settings, units: current.units};
					dataManager.save(data)
						.then(() => store.setState({isDirty: false, isSaving: false}))
						.catch((e) => { console.error(e); store.setState({isSaving: false}); });
				}, 500);
			}
		}
	});

	// Expose cleanup and loaded flag on the store for external use
	const originalLoad = store.getState().load;
	store.setState({
		load: async () => {
			await originalLoad();
			loaded = true;
		}
	} as any);

	(store as any).destroy = () => {
		if (saveTimeout) clearTimeout(saveTimeout);
		unsubscribe();
	};

	return store;
}
