/**
 * D3-based timeline engine.
 *
 * Replaces useTimelineEngine with a logarithmic time scale that can span
 * Big Bang (13.8 Ba) to today. Handles Level-of-Detail (LoD) filtering
 * via zoom k-factor and computes proportional y positions for all entries.
 *
 * Year convention in TimelineEntry.time:
 *   style:"unix"  → value is Unix ms timestamp → convert to AD year
 *   style:"free"  → value is plain integer year string (negative = BC/prehistoric)
 *
 * Log scale domain: all years are offset by YEAR_OFFSET to stay positive.
 *   domain value = year + YEAR_OFFSET
 *   YEAR_OFFSET = 13_800_000_001  (Big Bang + 1 to avoid log(0))
 *
 * The hook outputs y positions in BASE_HEIGHT pixel space [0, BASE_HEIGHT].
 * The spine component applies d3.ZoomTransform to convert to screen coords.
 */

import { useMemo } from "react"
import { scaleLog } from "d3-scale"
import type { TimelineEntry } from "@/src/types"
import { BIG_HISTORY_ANCHORS } from "@/src/data/bigHistoryAnchors"

// ── Constants ─────────────────────────────────────────────────────────────────

/** Offset so all years are strictly positive for d3.scaleLog */
export const YEAR_OFFSET = 13_800_000_001

/** Total pixel height of the timeline at zoom k=1 */
export const BASE_HEIGHT = 4000

// ── Year extraction ───────────────────────────────────────────────────────────

/** Returns the calendar year (AD, negative = BC/prehistoric) for an entry, or null if undated. */
export function entryYear(entry: TimelineEntry): number | null {
	if (entry.time.style === "unix") {
		const ms = parseInt(entry.time.value)
		if (isNaN(ms)) return null
		return new Date(ms).getFullYear()
	}
	if (entry.time.style === "free") {
		const y = parseInt(entry.time.value)
		if (isNaN(y)) return null
		return y
	}
	return null
}

/** Convert a calendar year to the log-scale domain value (always > 0). */
export function yearToDomain(year: number): number {
	return year + YEAR_OFFSET
}

/** Convert a log-scale domain value back to a calendar year. */
export function domainToYear(domain: number): number {
	return domain - YEAR_OFFSET
}

// ── LoD ───────────────────────────────────────────────────────────────────────

/**
 * Minimum significance score to render at a given zoom k-factor.
 *
 *   k < 10        → cosmic view  → sig 5 only  (Big Bang, first life, etc.)
 *   k < 100       → era view     → sig 4+
 *   k < 10_000    → century view → sig 3+
 *   k < 1_000_000 → decade view  → sig 2+
 *   k ≥ 1_000_000 → full detail  → sig 1+
 */
export function minSigForZoom(k: number): number {
	if (k < 10) return 5
	if (k < 100) return 4
	if (k < 10_000) return 3
	if (k < 1_000_000) return 2
	return 1
}

// ── Axis tick generation ──────────────────────────────────────────────────────

export type AxisTick = {
	/** y position in BASE_HEIGHT pixel space */
	y: number
	label: string
	isMajor: boolean
}

/**
 * Format a year for axis display.
 * Handles prehistoric scales (billions, millions) down to single years.
 */
function formatYear(year: number): string {
	const abs = Math.abs(year)
	const suffix = year < 0 ? " BP" : " AD"
	if (abs >= 1_000_000_000) return `${(abs / 1_000_000_000).toFixed(1)} Ba${year < 0 ? "" : ""}`
	if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(0)} Ma`
	if (abs >= 10_000) return `${(abs / 1_000).toFixed(0)} ka`
	if (year < 0) return `${abs} BC`
	return `${year}${suffix}`
}

/**
 * Generate axis ticks appropriate for the current zoom level.
 * Tick density adapts so the spine is never overcrowded or empty.
 */
function buildAxisTicks(
	scale: ReturnType<typeof scaleLog>,
	visibleYearMin: number,
	visibleYearMax: number,
): AxisTick[] {
	// Candidate tick years (round numbers at appropriate granularity)
	const span = visibleYearMax - visibleYearMin
	let step: number

	if (span > 1_000_000_000)      step = 1_000_000_000  // 1 Ba
	else if (span > 100_000_000)   step = 100_000_000    // 100 Ma
	else if (span > 10_000_000)    step = 10_000_000     // 10 Ma
	else if (span > 1_000_000)     step = 1_000_000      // 1 Ma
	else if (span > 100_000)       step = 100_000        // 100 ka
	else if (span > 10_000)        step = 10_000         // 10 ka
	else if (span > 1_000)         step = 1_000          // 1 ka
	else if (span > 100)           step = 100
	else if (span > 10)            step = 10
	else                           step = 1

	const ticks: AxisTick[] = []
	const start = Math.ceil(visibleYearMin / step) * step
	for (let year = start; year <= visibleYearMax; year += step) {
		const domain = yearToDomain(year)
		if (domain <= 0) continue
		const y = scale(domain) as number
		if (!isFinite(y)) continue
		ticks.push({
			y,
			label: formatYear(year),
			isMajor: year % (step * 5) === 0,
		})
	}
	return ticks
}

// ── Engine output types ───────────────────────────────────────────────────────

export type PositionedEntry = {
	entry: TimelineEntry
	/** y in BASE_HEIGHT pixel space; apply ZoomTransform to get screen coords */
	y: number
}

export type D3TimelineEngine = {
	/** Dated entries sorted by year, filtered by LoD, with y positions */
	positionedEntries: PositionedEntry[]
	/** Axis tick marks for the SVG spine */
	axisTicks: AxisTick[]
	/** Undated entries (style:"free" with non-numeric value) — rendered below */
	freeEntries: TimelineEntry[]
	/** D3 log scale — use to convert years to pixel y */
	scale: ReturnType<typeof scaleLog>
	/** Minimum significance shown at current zoom */
	visibleMinSig: number
	/** Total pixel height at k=1 */
	totalHeight: number
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useD3TimelineEngine(
	units: TimelineEntry[],
	showHidden: boolean,
	showAnchors: boolean,
	zoomK: number = 1,
): D3TimelineEngine {
	return useMemo(() => {
		// Merge user units + anchor entries
		const allEntries: TimelineEntry[] = showAnchors
			? [...units, ...BIG_HISTORY_ANCHORS]
			: units

		const visible = showHidden ? allEntries : allEntries.filter(u => !u.isHidden)

		// Split dated vs free (undated)
		const dated: Array<{ entry: TimelineEntry; year: number }> = []
		const freeEntries: TimelineEntry[] = []

		for (const entry of visible) {
			const year = entryYear(entry)
			if (year !== null) {
				dated.push({ entry, year })
			} else {
				freeEntries.push(entry)
			}
		}

		dated.sort((a, b) => a.year - b.year)

		// LoD filter — anchors without a significance score default to 3
		const minSig = minSigForZoom(zoomK)
		const filtered = dated.filter(({ entry }) => {
			const sig = entry.significance ?? (entry.isAnchor ? 3 : 1)
			return sig >= minSig
		})

		// Build log scale over full Big History domain
		const domainMin = yearToDomain(-13_800_000_000)  // Big Bang
		const domainMax = yearToDomain(new Date().getFullYear() + 1)

		const scale = scaleLog<number>()
			.domain([domainMin, domainMax])
			.range([0, BASE_HEIGHT])
			.clamp(true)

		// Compute y positions
		const positionedEntries: PositionedEntry[] = filtered.map(({ entry, year }) => ({
			entry,
			y: scale(yearToDomain(year)),
		}))

		// Compute axis ticks over the full domain
		const axisTicks = buildAxisTicks(
			scale,
			-13_800_000_000,
			new Date().getFullYear(),
		)

		return {
			positionedEntries,
			axisTicks,
			freeEntries,
			scale,
			visibleMinSig: minSig,
			totalHeight: BASE_HEIGHT,
		}
	}, [units, showHidden, showAnchors, zoomK])
}
