import { ItemView, WorkspaceLeaf } from "obsidian";
import { StrictMode, useState, useMemo } from "react";
import { createRoot, Root } from "react-dom/client";
import type HistoricaPlugin from "@/main";
import { getNoteTags } from "@/src/utils";
import { useVaultEntries } from "./global/useVaultEntries";
import { VirtualCardList } from "./global/VirtualCardList";
import { FilterBar, FilterState, DEFAULT_FILTERS } from "./global/FilterBar";
import { InlineLoadingState } from "./InlineLoadingState";

export const HISTORICA_GLOBAL_VIEW_TYPE = "historica-global-timeline";

export class GlobalTimelineView extends ItemView {
	private plugin: HistoricaPlugin;
	private reactRoot: Root | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: HistoricaPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	override getViewType(): string {
		return HISTORICA_GLOBAL_VIEW_TYPE;
	}

	override getDisplayText(): string {
		return "Historica Global Timeline";
	}

	override getIcon(): string {
		return "globe";
	}

	override async onOpen(): Promise<void> {
		this.contentEl.empty();
		this.contentEl.style.display = "flex";
		this.contentEl.style.flexDirection = "column";
		this.contentEl.style.height = "100%";
		this.reactRoot = createRoot(this.contentEl);
		this.reactRoot.render(
			<StrictMode>
				<GlobalTimelineRoot plugin={this.plugin} />
			</StrictMode>
		);
	}

	override async onClose(): Promise<void> {
		this.reactRoot?.unmount();
		this.reactRoot = null;
	}
}

function GlobalTimelineRoot({ plugin }: { plugin: HistoricaPlugin }) {
	const { entries, loading } = useVaultEntries(plugin);
	const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

	const noteTagCache = useMemo(() => {
		const cache = new Map<string, string[]>();
		for (const e of entries) {
			if (!cache.has(e.notePath)) {
				cache.set(e.notePath, getNoteTags(plugin, e.notePath));
			}
		}
		return cache;
	}, [entries, plugin]);

	const filtered = useMemo(() => entries.filter(e => {
		if (e.year !== null) {
			if (filters.yearMin !== null && e.year < filters.yearMin) return false;
			if (filters.yearMax !== null && e.year > filters.yearMax) return false;
		}
		if (filters.noteFilter && e.notePath !== filters.noteFilter) return false;
		if (filters.tagFilter) {
			const tags = noteTagCache.get(e.notePath) ?? [];
			if (!tags.includes(filters.tagFilter)) return false;
		}
		return true;
	}), [entries, filters, noteTagCache]);

	if (loading) {
		return (
			<div className="historica-global-timeline flex flex-col h-full overflow-hidden">
				<InlineLoadingState message="Loading global timeline\u2026"/>
			</div>
		);
	}

	return (
		<div className="historica-global-timeline flex flex-col h-full overflow-hidden">
			<FilterBar
				allEntries={entries}
				plugin={plugin}
				filters={filters}
				onChange={setFilters}
				filteredCount={filtered.length}
			/>
			<VirtualCardList entries={filtered} plugin={plugin} />
		</div>
	);
}
