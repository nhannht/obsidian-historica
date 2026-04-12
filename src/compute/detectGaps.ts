import type { GlobalEntry } from "@/src/ui/global/useVaultEntries";

export type Gap = {
	startMs: number;
	endMs: number;
	months: number;
	label: string;
};

const MONTH_NAMES = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function monthBucket(ms: number): number {
	const d = new Date(ms);
	return d.getFullYear() * 12 + d.getMonth();
}

function bucketToMs(bucket: number): number {
	const year = Math.floor(bucket / 12);
	const month = ((bucket % 12) + 12) % 12;
	return Date.UTC(year, month, 1);
}

function formatBucket(bucket: number): string {
	const ms = bucketToMs(bucket);
	const d = new Date(ms);
	const year = d.getFullYear();
	const monthName = MONTH_NAMES[d.getMonth()];
	// JS year 0 = 1 BC, year -1 = 2 BC, year -508 = 509 BC
	if (year <= 0) return `${monthName} ${Math.abs(year) + 1} BC`;
	return `${monthName} ${year}`;
}

/**
 * Detect temporal gaps in a set of vault entries.
 * Returns up to 5 gaps longer than `thresholdMonths`, sorted by duration desc.
 */
export function detectGaps(entries: GlobalEntry[], thresholdMonths = 3): Gap[] {
	const timed = entries.filter(
		(e): e is GlobalEntry & { unixTime: number } => e.unixTime !== null,
	);
	if (timed.length < 2) return [];

	// ensure ascending order
	timed.sort((a, b) => a.unixTime - b.unixTime);

	// deduplicate by month bucket so one busy month doesn't mask a real gap
	const seen = new Set<number>();
	const buckets: number[] = [];
	for (const e of timed) {
		const b = monthBucket(e.unixTime);
		if (!seen.has(b)) {
			seen.add(b);
			buckets.push(b);
		}
	}

	const gaps: Gap[] = [];
	for (let i = 0; i < buckets.length - 1; i++) {
		const curr = buckets[i];
		const next = buckets[i + 1];
		const emptyMonths = next - curr - 1;
		if (emptyMonths >= thresholdMonths) {
			const gapStart = curr + 1;
			const gapEnd = next - 1;
			const startMs = bucketToMs(gapStart);
			const endMs = bucketToMs(gapEnd);
			const startLabel = formatBucket(gapStart);
			const endLabel = formatBucket(gapEnd);
			const label =
				gapStart === gapEnd
					? `${startLabel} (1 month)`
					: `${startLabel} – ${endLabel} (${emptyMonths} months)`;
			gaps.push({ startMs, endMs, months: emptyMonths, label });
		}
	}

	gaps.sort((a, b) => b.months - a.months);
	return gaps.slice(0, 5);
}
