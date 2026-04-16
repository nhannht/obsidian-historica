/**
 * D3-based timeline engine — linear scale with dynamic domain.
 *
 * Domain is computed from user data: [userMin − 10%, userMax + 10%].
 * Big History anchors are included only when they fall within the domain.
 * LoD filtering uses visible span in years (totalSpan / zoomK).
 *
 * Year convention in TimelineEntry.time:
 *   style:"unix"  → value is Unix ms timestamp → convert to AD year
 *   style:"free"  → value is plain integer year string (negative = BC/prehistoric)
 */

import { useMemo } from "react"
import { scaleLinear } from "d3-scale"
import type { TimelineEntry } from "@/src/types"
import { BIG_HISTORY_ANCHORS } from "@/src/data/bigHistoryAnchors"
import { entrySig } from "@/src/utils"

// ── Constants ─────────────────────────────────────────────────────────────────

/** Total pixel height of the timeline at zoom k=1; matches VIEWPORT_H so k=1 shows full data range */
export const BASE_HEIGHT = 600

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

// ── LoD ───────────────────────────────────────────────────────────────────────

/**
 * Minimum significance score based on how many years are currently visible.
 * visibleSpanYears = totalDomainSpan / zoomK
 */
export function minSigForZoom(visibleSpanYears: number): number {
	if (visibleSpanYears > 1_000_000_000) return 5   // > 1 Ga: cosmic
	if (visibleSpanYears > 10_000_000)    return 4   // > 10 Ma: era
	if (visibleSpanYears > 100_000)       return 3   // > 100 ka: deep history
	if (visibleSpanYears > 1_000)         return 2   // > 1 ka: ancient/medieval
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
	if (abs >= 1_000_000_000) return `${(abs / 1_000_000_000).toFixed(1)} Ba`
	if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(0)} Ma`
	if (abs >= 10_000) return `${(abs / 1_000).toFixed(0)} ka`
	if (year < 0) return `${abs} BC`
	return `${year} AD`
}

function buildAxisTicks(
	scale: ReturnType<typeof scaleLinear<number>>,
	yearMin: number,
	yearMax: number,
): AxisTick[] {
	const span = yearMax - yearMin
	let step: number

	if (span > 1_000_000_000)      step = 1_000_000_000
	else if (span > 100_000_000)   step = 100_000_000
	else if (span > 10_000_000)    step = 10_000_000
	else if (span > 1_000_000)     step = 1_000_000
	else if (span > 100_000)       step = 100_000
	else if (span > 10_000)        step = 10_000
	else if (span > 1_000)         step = 1_000
	else if (span > 100)           step = 100
	else if (span > 10)            step = 10
	else                           step = 1

	const ticks: AxisTick[] = []
	const start = Math.ceil(yearMin / step) * step
	for (let year = start; year <= yearMax; year += step) {
		const y = scale(year) as number
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
	/** D3 linear scale — call scale(year) to get pixel y */
	scale: ReturnType<typeof scaleLinear<number>>
	/** Minimum significance shown at current zoom */
	visibleMinSig: number
	/** Total pixel height at k=1 */
	totalHeight: number
	/** Earliest year of the computed domain (user data min − padding) */
	yearMin: number
	/** Latest year of the computed domain (user data max + padding) */
	yearMax: number
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useD3TimelineEngine(
	units: TimelineEntry[],
	showHidden: boolean,
	zoomK: number = 1,
): D3TimelineEngine {
	// ── Layout memo: recomputes only when data changes, not on zoom ──────────
	const layout = useMemo(() => {
		const userVisible = showHidden ? units : units.filter(u => !u.isHidden)
		const userDated: Array<{ entry: TimelineEntry; year: number }> = []
		const freeEntries: TimelineEntry[] = []

		for (const entry of userVisible) {
			const year = entryYear(entry)
			if (year !== null) userDated.push({ entry, year })
			else freeEntries.push(entry)
		}

		let rawMin: number
		let rawMax: number
		if (userDated.length === 0) {
			const now = new Date().getFullYear()
			rawMin = now - 50
			rawMax = now
		} else {
			rawMin = userDated.reduce((m, d) => Math.min(m, d.year), Infinity)
			rawMax = userDated.reduce((m, d) => Math.max(m, d.year), -Infinity)
		}

		const rawSpan = Math.max(rawMax - rawMin, 10)
		const pad     = rawSpan * 0.1
		const yearMin = rawMin - pad
		const yearMax = rawMax + pad

		// Avoid double entryYear() call: filter and capture year in one pass
		const anchorsInRange: Array<{ entry: TimelineEntry; year: number }> = []
		for (const anchor of BIG_HISTORY_ANCHORS) {
			const year = entryYear(anchor)
			if (year !== null && year >= yearMin && year <= yearMax) {
				anchorsInRange.push({ entry: anchor, year })
			}
		}

		const allDated: Array<{ entry: TimelineEntry; year: number }> = [
			...userDated,
			...anchorsInRange,
		]
		allDated.sort((a, b) => a.year - b.year)

		const scale = scaleLinear<number>()
			.domain([yearMin, yearMax])
			.range([0, BASE_HEIGHT])
			.clamp(true)

		const axisTicks = buildAxisTicks(scale, yearMin, yearMax)

		return { yearMin, yearMax, scale, axisTicks, allDated, freeEntries }
	}, [units, showHidden])

	// ── LoD memo: recomputes on zoom (cheap) ─────────────────────────────────
	return useMemo(() => {
		const { yearMin, yearMax, scale, axisTicks, allDated, freeEntries } = layout
		const visibleSpanYears = (yearMax - yearMin) / zoomK
		const minSig = minSigForZoom(visibleSpanYears)

		const filtered = allDated.filter(({ entry }) => entrySig(entry) >= minSig)

		const positionedEntries: PositionedEntry[] = filtered.map(({ entry, year }) => ({
			entry,
			y: scale(year) as number,
		}))

		return {
			positionedEntries,
			axisTicks,
			freeEntries,
			scale,
			visibleMinSig: minSig,
			totalHeight: BASE_HEIGHT,
			yearMin,
			yearMax,
		}
	}, [layout, zoomK])
}
