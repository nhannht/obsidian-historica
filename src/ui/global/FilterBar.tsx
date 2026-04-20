import { useMemo, useState, useRef, useEffect } from "react";
import type HistoricaPlugin from "@/main";
import { notePathToTitle, getNoteTags } from "@/src/utils";
import { GlobalEntry } from "./useVaultEntries";
import { RugHeat } from "@/src/ui/RugHeat";
import { FilterChip } from "@/src/ui/FilterChip";
import { StatPill } from "@/src/ui/StatPill";

export interface FilterState {
	yearMin: number | null;
	yearMax: number | null;
	noteFilter: string;   // "" = all
	tagFilter: string;    // "" = all
}

export const DEFAULT_FILTERS: FilterState = {
	yearMin: null,
	yearMax: null,
	noteFilter: "",
	tagFilter: "",
};

interface FilterBarProps {
	allEntries: GlobalEntry[];
	plugin: HistoricaPlugin;
	filters: FilterState;
	onChange: (f: FilterState) => void;
	filteredCount: number;
}

export function FilterBar({ allEntries, plugin, filters, onChange, filteredCount }: FilterBarProps) {
	const [expanded, setExpanded] = useState(false);
	const rugRef = useRef<HTMLDivElement>(null);
	const [rugWidth, setRugWidth] = useState(400);

	useEffect(() => {
		const el = rugRef.current;
		if (!el) return;
		const ro = new ResizeObserver(([entry]) => setRugWidth(entry.contentRect.width));
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const { absoluteMin, absoluteMax, notes, tags, rugYears } = useMemo(() => {
		const years = allEntries.map(e => e.year).filter((y): y is number => y !== null);
		const uniqueNotes = [...new Set(allEntries.map(e => e.notePath).filter(Boolean))].sort();
		const tagSet = new Set<string>();
		for (const notePath of uniqueNotes) {
			for (const t of getNoteTags(plugin, notePath)) tagSet.add(t);
		}
		return {
			absoluteMin: years.length ? years.reduce((a, b) => Math.min(a, b)) : null,
			absoluteMax: years.length ? years.reduce((a, b) => Math.max(a, b)) : null,
			notes: uniqueNotes,
			tags: [...tagSet].sort(),
			rugYears: years,
		};
	}, [allEntries, plugin]);

	const yearMin = filters.yearMin ?? absoluteMin ?? 0;
	const yearMax = filters.yearMax ?? absoluteMax ?? 0;

	const activeCount = [
		filters.yearMin !== null || filters.yearMax !== null,
		filters.noteFilter !== "",
		filters.tagFilter !== "",
	].filter(Boolean).length;

	const showRug = absoluteMin !== null && absoluteMax !== null && absoluteMin !== absoluteMax;

	return (
		<div className="flex-shrink-0 border-b border-[var(--background-modifier-border)]">
			{/* Header row */}
			<div className="flex items-center gap-2 px-4 py-1.5">
				<button
					onClick={() => setExpanded(e => !e)}
					className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-normal)] transition-colors"
				>
					<span>{expanded ? "▾" : "▸"}</span>
					<span>Filter</span>
					{activeCount > 0 && (
						<span className="bg-[var(--color-accent)] text-white rounded-full px-1.5 py-0.5 text-[10px] leading-none">
							{activeCount}
						</span>
					)}
				</button>

				{filters.noteFilter && (
					<FilterChip label={notePathToTitle(filters.noteFilter)} onRemove={() => onChange({ ...filters, noteFilter: "" })} />
				)}
				{filters.tagFilter && (
					<FilterChip label={filters.tagFilter} onRemove={() => onChange({ ...filters, tagFilter: "" })} />
				)}

				<span style={{ marginLeft: "auto" }}>
					<StatPill value={`${filteredCount}${filteredCount !== allEntries.length ? ` / ${allEntries.length}` : ""} events`}/>
				</span>
				{activeCount > 0 && (
					<button
						onClick={() => onChange(DEFAULT_FILTERS)}
						className="text-xs text-[var(--text-muted)] hover:text-[var(--text-normal)]"
					>
						Clear
					</button>
				)}
			</div>

			{/* RugHeat — always visible */}
			{showRug && (
				<div ref={rugRef} className="px-4 pb-2">
					<RugHeat years={rugYears} min={absoluteMin!} max={absoluteMax!} width={Math.max(1, rugWidth)} tickH={10} stripeH={5} />
				</div>
			)}

			{/* Expanded panel */}
			{expanded && (
				<div className="px-4 pb-3 flex flex-col gap-3">
					{absoluteMin !== null && absoluteMax !== null && absoluteMin !== absoluteMax && (
						<div className="flex flex-col gap-1">
							<span className="text-xs text-[var(--text-muted)]">
								Year range: {yearMin} – {yearMax}
							</span>
							<div className="flex gap-2 items-center">
								<input
									type="range"
									min={absoluteMin}
									max={absoluteMax}
									value={yearMin}
									onChange={e => onChange({ ...filters, yearMin: parseInt(e.target.value) })}
									className="flex-1 accent-[var(--color-accent)]"
								/>
								<input
									type="range"
									min={absoluteMin}
									max={absoluteMax}
									value={yearMax}
									onChange={e => onChange({ ...filters, yearMax: parseInt(e.target.value) })}
									className="flex-1 accent-[var(--color-accent)]"
								/>
							</div>
						</div>
					)}

					{notes.length > 0 && (
						<div className="flex items-center gap-2">
							<span className="text-xs text-[var(--text-muted)] flex-shrink-0">Note</span>
							<select
								value={filters.noteFilter}
								onChange={e => onChange({ ...filters, noteFilter: e.target.value })}
								className="flex-1 text-xs bg-[var(--background-primary)] border border-[var(--background-modifier-border)] rounded px-2 py-1 text-[var(--text-normal)]"
							>
								<option value="">All notes</option>
								{notes.map(n => (
									<option key={n} value={n}>{notePathToTitle(n)}</option>
								))}
							</select>
						</div>
					)}

					{tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5 items-center">
							<span className="text-xs text-[var(--text-muted)]">Tag</span>
							{tags.map(tag => (
								<FilterChip
									key={tag}
									label={tag}
									active={filters.tagFilter === tag}
									onClick={() => onChange({ ...filters, tagFilter: filters.tagFilter === tag ? "" : tag })}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
