import {createStore} from "zustand/vanilla";
import {MarkdownPostProcessorContext, Notice, TFile} from "obsidian";
import {moment} from "../moment-fix";
import HistoricaPlugin from "@/main";
import {HistoricaFileData, HistoricaSettingNg, PlotUnitNg} from "@/src/types";
import {GenerateRandomId} from "@/src/utils";
import TimelineDataManager, {dataFilePath} from "@/src/data/TimelineDataManager";
import MarkdownProcesser from "@/src/compute/MarkdownParser";

interface TimelineState {
	units: PlotUnitNg[];
	settings: HistoricaSettingNg;
	isLoading: boolean;
	error: string | null;
	showHidden: boolean;
	isDirty: boolean;
	isSaving: boolean;
}

interface TimelineActions {
	load(): Promise<void>;
	manualSave(): Promise<void>;
	addUnit(index: number): Promise<void>;
	removeUnit(id: string): void;
	editUnit(id: string, updatedUnit: PlotUnitNg): void;
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
	toggleAutoSave(): void;
}

export type TimelineStore = TimelineState & TimelineActions;

export function createTimelineStore(
	plugin: HistoricaPlugin,
	initialSettings: HistoricaSettingNg,
	ctx: MarkdownPostProcessorContext,
) {
	const dataManager = new TimelineDataManager(plugin);

	const ensureBlockId = async () => {
		const {settings} = store.getState();
		const updated = await dataManager.ensureBlockId(settings, ctx);
		if (updated !== settings) store.setState({settings: updated});
		return updated;
	};

	const buildSaveData = (): HistoricaFileData => {
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
						});
						return;
					}
				}
				set({isLoading: false});
			} catch (e) {
				set({error: (e as Error).message, isLoading: false});
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
			const {units} = get();
			const file = plugin.app.vault.getAbstractFileByPath(path);
			if (!(file instanceof TFile)) return;

			const updated = await ensureBlockId();
			const parser = new MarkdownProcesser(plugin, updated);
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
	let loaded = false;

	const unsubscribe = store.subscribe((state, prev) => {
		if (!loaded) return;
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

	const originalLoad = store.getState().load;
	let fileWatcherRef: ((...data: unknown[]) => unknown) | null = null;

	store.setState({
		load: async () => {
			await originalLoad();
			loaded = true;

			// Watch the data file for external edits (e.g. user opened via "Reveal data file")
			const {settings} = store.getState();
			if (settings.blockId !== "-1") {
				const dataPath = dataFilePath(settings.blockId);
				let reloadTimeout: ReturnType<typeof setTimeout> | null = null;
				fileWatcherRef = (file: unknown) => {
					if (!(file instanceof TFile) || file.path !== dataPath) return;
					if (store.getState().isSaving) return;
					if (reloadTimeout) clearTimeout(reloadTimeout);
					reloadTimeout = setTimeout(() => {
						dataManager.load(settings.blockId).then((data) => {
							if (data) {
								loaded = false;
								store.setState({
									units: data.units,
									settings: {...data.settings, autoSave: data.settings.autoSave ?? true},
									isDirty: false,
								});
								loaded = true;
							}
						}).catch((e) => console.error("Failed to reload from external edit:", e));
					}, 300);
				};
				plugin.app.vault.on("modify", fileWatcherRef);
			}
		}
	} as any);

	(store as any).destroy = () => {
		if (saveTimeout) clearTimeout(saveTimeout);
		unsubscribe();
		if (fileWatcherRef) {
			plugin.app.vault.off("modify", fileWatcherRef);
			fileWatcherRef = null;
		}
	};

	return store;
}
