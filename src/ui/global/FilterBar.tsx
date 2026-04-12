import { useMemo, useState } from "react";
import type HistoricaPlugin from "@/main";
import { notePathToTitle, getNoteTags } from "@/src/utils";
import { GlobalEntry } from "./useVaultEntries";

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
}

export function FilterBar({ allEntries, plugin, filters, onChange }: FilterBarProps) {
	const [expanded, setExpanded] = useState(false);

	const { absoluteMin, absoluteMax, notes, tags } = useMemo(() => {
		// Use pre-computed year from GlobalEntry to avoid repeated new Date() calls
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
		};
	}, [allEntries, plugin]);

	const yearMin = filters.yearMin ?? absoluteMin ?? 0;
	const yearMax = filters.yearMax ?? absoluteMax ?? 0;

	const activeCount = [
		filters.yearMin !== null || filters.yearMax !== null,
		filters.noteFilter !== "",
		filters.tagFilter !== "",
	].filter(Boolean).length;

	return (
		<div className="flex-shrink-0 border-b border-[var(--background-modifier-border)]">
			{/* Collapsed row */}
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

				{/* Active filter chips (quick clear) */}
				{filters.noteFilter && (
					<Chip label={notePathToTitle(filters.noteFilter)} onRemove={() => onChange({ ...filters, noteFilter: "" })} />
				)}
				{filters.tagFilter && (
					<Chip label={filters.tagFilter} onRemove={() => onChange({ ...filters, tagFilter: "" })} />
				)}
				{activeCount > 0 && (
					<button
						onClick={() => onChange(DEFAULT_FILTERS)}
						className="ml-auto text-xs text-[var(--text-muted)] hover:text-[var(--text-normal)]"
					>
						Clear all
					</button>
				)}
			</div>

			{/* Expanded panel */}
			{expanded && (
				<div className="px-4 pb-3 flex flex-col gap-3">
					{/* Year range */}
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

					{/* Source note */}
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
									<option key={n} value={n}>
										{notePathToTitle(n)}
									</option>
								))}
							</select>
						</div>
					)}

					{/* Tags */}
					{tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5 items-center">
							<span className="text-xs text-[var(--text-muted)]">Tag</span>
							{tags.map(tag => (
								<button
									key={tag}
									onClick={() => onChange({ ...filters, tagFilter: filters.tagFilter === tag ? "" : tag })}
									className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
										filters.tagFilter === tag
											? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
											: "border-[var(--background-modifier-border)] text-[var(--text-muted)] hover:border-[var(--color-accent)]"
									}`}
								>
									{tag}
								</button>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
	return (
		<span className="flex items-center gap-1 text-xs bg-[var(--background-secondary)] px-2 py-0.5 rounded-full border border-[var(--background-modifier-border)]">
			{label}
			<button onClick={onRemove} className="text-[var(--text-muted)] hover:text-[var(--text-normal)]">×</button>
		</span>
	);
}
