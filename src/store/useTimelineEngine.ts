import { useMemo } from "react"
import { TimelineEntry } from "@/src/types"

export type VirtualRow =
	| { type: "decade"; decade: number }
	| { type: "gap"; years: number; pixelHeight: number }
	| { type: "entry"; entry: TimelineEntry }

export type TimelineEngine = {
	rows: VirtualRow[]
	totalSpan: number
}

const GAP_PX_PER_YEAR = 12
const GAP_PX_MAX = 120
const GAP_THRESHOLD_YEARS = 2

function entryYear(entry: TimelineEntry): number | null {
	if (entry.time.style !== "unix") return null
	const ms = parseInt(entry.time.value)
	if (isNaN(ms)) return null
	return new Date(ms).getFullYear()
}

export function useTimelineEngine(units: TimelineEntry[], showHidden: boolean): TimelineEngine {
	return useMemo(() => {
		const visible = showHidden ? units : units.filter(u => !u.isHidden)

		const dated = visible.filter(e => entryYear(e) !== null)
		const free = visible.filter(e => entryYear(e) === null)

		dated.sort((a, b) => parseInt(a.time.value) - parseInt(b.time.value))

		const rows: VirtualRow[] = []
		let prevYear: number | null = null
		let prevDecade: number | null = null

		for (const entry of dated) {
			const year = entryYear(entry)!
			const decade = Math.floor(year / 10) * 10

			// Gap spacer before decade marker — dead time is visible
			if (prevYear !== null && year - prevYear > GAP_THRESHOLD_YEARS) {
				const gapYears = year - prevYear
				rows.push({
					type: "gap",
					years: gapYears,
					pixelHeight: Math.min(gapYears * GAP_PX_PER_YEAR, GAP_PX_MAX),
				})
			}

			if (decade !== prevDecade) {
				rows.push({ type: "decade", decade })
				prevDecade = decade
			}

			rows.push({ type: "entry", entry })
			prevYear = year
		}

		if (free.length > 0) {
			rows.push({ type: "decade", decade: -1 })
			for (const entry of free) {
				rows.push({ type: "entry", entry })
			}
		}

		const firstYear = dated.length > 0 ? entryYear(dated[0])! : 0
		const lastYear = prevYear ?? firstYear

		return { rows, totalSpan: lastYear - firstYear }
	}, [units, showHidden])
}
