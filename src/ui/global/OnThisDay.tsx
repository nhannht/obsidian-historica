import { useState } from "react";
import { GlobalEntry } from "./useVaultEntries";

declare const moment: (ts: number) => {
	format: (fmt: string) => string;
	month: () => number;
	date: () => number;
	year: () => number;
};

function matchesToday(entry: GlobalEntry, now: ReturnType<typeof moment>): boolean {
	if (entry.unixTime === null) return false;
	const entryMoment = moment(entry.unixTime);
	return (
		entryMoment.month() === now.month() &&
		entryMoment.date() === now.date() &&
		entryMoment.year() !== now.year()   // exclude current year — want "in prior years"
	);
}

function yearsAgo(entry: GlobalEntry, nowYear: number): number {
	return nowYear - moment(entry.unixTime!).year();
}

interface OnThisDayProps {
	entries: GlobalEntry[];
}

export function OnThisDay({ entries }: OnThisDayProps) {
	const [expanded, setExpanded] = useState(false);

	const now = moment(Date.now());
	const nowYear = now.year();
	const todayEntries = entries
		.filter(e => matchesToday(e, now))
		.sort((a, b) => a.unixTime! - b.unixTime!);

	if (todayEntries.length === 0) return null;

	const shown = expanded ? todayEntries : todayEntries.slice(0, 2);

	return (
		<div className="flex-shrink-0 bg-[var(--background-secondary)] border-b border-[var(--background-modifier-border)] px-4 py-2">
			<div className="flex items-center gap-2 mb-1.5">
				<span className="text-xs font-semibold text-[var(--text-accent)] uppercase tracking-wide">
					On This Day
				</span>
				<span className="text-xs text-[var(--text-muted)]">
					{todayEntries.length} {todayEntries.length === 1 ? "memory" : "memories"}
				</span>
			</div>

			<div className="flex flex-col gap-1">
				{shown.map((entry) => (
					<div key={entry.id} className="flex gap-2 text-xs">
						<span className="flex-shrink-0 text-[var(--text-muted)] w-16">
							{yearsAgo(entry, nowYear)}y ago
						</span>
						<span className="text-[var(--text-normal)] line-clamp-1 flex-1">
							{entry.sentence}
						</span>
					</div>
				))}
			</div>

			{todayEntries.length > 2 && (
				<button
					onClick={() => setExpanded(e => !e)}
					className="mt-1 text-xs text-[var(--text-accent)] hover:underline"
				>
					{expanded ? "Show less" : `+${todayEntries.length - 2} more`}
				</button>
			)}
		</div>
	);
}
