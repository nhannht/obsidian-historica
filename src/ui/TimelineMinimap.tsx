/**
 * TimelineMinimap — horizontal strip with:
 *   - density histogram (event count per time bucket)
 *   - view box: draggable viewport indicator (top tab = pan, ◈ diamonds = resize)
 *   - filter bar (optional): year-range filter overlay (bottom knob = pan, dots = resize)
 *
 * The two bars share the same track. Their pan handles go in opposite
 * vertical directions (tab ↑, knob ↓) so they never collide.
 *
 * Clicking the track pans the view box to center on that year.
 * Double-clicking resets the view box to the full domain.
 */

import { useRef, useCallback, useMemo } from "react"
import { BASE_HEIGHT } from "@/src/store/useD3TimelineEngine"
import { entrySig } from "@/src/utils"

const NUM_BUCKETS  = 30
const DENSITY_H    = 16   // max density bar height in px
const TRACK_Y      = 20   // y where the track starts (density bars fill 0..TRACK_Y)
const TRACK_H      = 6    // track height
const TAB_W        = 14   // view-box top tab width
const TAB_H        = 10   // view-box top tab height
const DIAMOND      = 12   // diamond handle bounding box size (width & height)
const KNOB_R       = 5    // filter bottom knob radius
const LABEL_H      = 12   // year label height below knob
const TOTAL_H      = TRACK_Y + TRACK_H + KNOB_R * 2 + 4 + LABEL_H
const NOW_YEAR     = new Date().getFullYear()

interface Props {
	/** Earliest year of the active domain */
	yearMin: number
	/** Latest year of the active domain */
	yearMax: number
	/** Current viewport range [leftYear, rightYear] — the view box */
	yearRange: [number, number]
	/** Called when the user moves the view box */
	onYearRangeChange: (range: [number, number]) => void
	/** All positioned entries — used for density histogram */
	positionedEntries: Array<{ entry: import("@/src/types").TimelineEntry; y: number }>
	/** Optional second bar: significance / year-range filter overlay */
	filterRange?: [number, number]
	/** Called when the user moves the filter bar */
	onFilterRangeChange?: (range: [number, number]) => void
}

export function TimelineMinimap({
	yearMin,
	yearMax,
	yearRange,
	onYearRangeChange,
	positionedEntries,
	filterRange: filterRangeProp,
	onFilterRangeChange,
}: Props) {
	const svgRef     = useRef<SVGSVGElement>(null)
	const domainSpan = yearMax - yearMin

	// ── View box fracs ────────────────────────────────────────────────────────
	const [leftYear, rightYear] = yearRange
	const leftFrac  = domainSpan > 0 ? (leftYear  - yearMin) / domainSpan : 0
	const rightFrac = domainSpan > 0 ? (rightYear - yearMin) / domainSpan : 1

	// ── Filter bar fracs (only when prop is provided) ─────────────────────────
	const hasFilter   = filterRangeProp !== undefined
	const filterRange = filterRangeProp ?? [yearMin, yearMax]
	const [fL, fR]    = filterRange
	const fLeftFrac   = domainSpan > 0 ? (fL - yearMin) / domainSpan : 0
	const fRightFrac  = domainSpan > 0 ? (fR - yearMin) / domainSpan : 1

	// ── Density histogram ─────────────────────────────────────────────────────
	const { bucketCounts, rawCounts, maxCount } = useMemo(() => {
		const counts = new Array(NUM_BUCKETS).fill(0)
		const raw    = new Array(NUM_BUCKETS).fill(0)
		for (const { entry, y } of positionedEntries) {
			if (entry.isAnchor) continue
			const frac   = Math.max(0, Math.min(1, y / BASE_HEIGHT))
			const bucket = Math.min(NUM_BUCKETS - 1, Math.floor(frac * NUM_BUCKETS))
			counts[bucket] += 1 + entrySig(entry) * 0.5
			raw[bucket]    += 1
		}
		return { bucketCounts: counts, rawCounts: raw, maxCount: Math.max(1, ...counts) }
	}, [positionedEntries])

	// ── Shared coord helper ───────────────────────────────────────────────────
	const xToYear = useCallback((clientX: number): number => {
		const el = svgRef.current
		if (!el) return yearMin
		const rect = el.getBoundingClientRect()
		const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
		return yearMin + frac * domainSpan
	}, [yearMin, domainSpan])

	// ── View box: edge drag (resize) ──────────────────────────────────────────
	const startDrag = useCallback((which: "left" | "right") => (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		const capL = leftYear, capR = rightYear
		const onMove = (ev: MouseEvent) => {
			const year = xToYear(ev.clientX)
			if (which === "left") {
				onYearRangeChange([Math.min(year, capR - 1), capR])
			} else {
				onYearRangeChange([capL, Math.max(year, capL + 1)])
			}
		}
		const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
		window.addEventListener("mousemove", onMove)
		window.addEventListener("mouseup", onUp)
	}, [leftYear, rightYear, xToYear, onYearRangeChange])

	// ── View box: top-tab drag (pan) ──────────────────────────────────────────
	const startBarDrag = useCallback((e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		const startY     = xToYear(e.clientX)
		const rangeWidth = rightYear - leftYear
		const capL       = leftYear
		const onMove = (ev: MouseEvent) => {
			const delta = xToYear(ev.clientX) - startY
			let newL = capL + delta, newR = newL + rangeWidth
			if (newL < yearMin) { newL = yearMin; newR = yearMin + rangeWidth }
			if (newR > yearMax) { newR = yearMax; newL = yearMax - rangeWidth }
			onYearRangeChange([newL, newR])
		}
		const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
		window.addEventListener("mousemove", onMove)
		window.addEventListener("mouseup", onUp)
	}, [leftYear, rightYear, xToYear, yearMin, yearMax, onYearRangeChange])

	// ── Filter bar: edge drag (resize) ────────────────────────────────────────
	const startFilterDrag = useCallback((which: "left" | "right") => (e: React.MouseEvent) => {
		if (!onFilterRangeChange) return
		e.preventDefault()
		e.stopPropagation()
		const capL = fL, capR = fR
		const onMove = (ev: MouseEvent) => {
			const year = xToYear(ev.clientX)
			if (which === "left") {
				onFilterRangeChange([Math.min(year, capR - 1), capR])
			} else {
				onFilterRangeChange([capL, Math.max(year, capL + 1)])
			}
		}
		const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
		window.addEventListener("mousemove", onMove)
		window.addEventListener("mouseup", onUp)
	}, [fL, fR, xToYear, onFilterRangeChange])

	// ── Filter bar: bottom-knob drag (pan) ────────────────────────────────────
	const startFilterBarDrag = useCallback((e: React.MouseEvent) => {
		if (!onFilterRangeChange) return
		e.preventDefault()
		e.stopPropagation()
		const startY     = xToYear(e.clientX)
		const rangeWidth = fR - fL
		const capL       = fL
		const onMove = (ev: MouseEvent) => {
			const delta = xToYear(ev.clientX) - startY
			let newL = capL + delta, newR = newL + rangeWidth
			if (newL < yearMin) { newL = yearMin; newR = yearMin + rangeWidth }
			if (newR > yearMax) { newR = yearMax; newL = yearMax - rangeWidth }
			onFilterRangeChange([newL, newR])
		}
		const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
		window.addEventListener("mousemove", onMove)
		window.addEventListener("mouseup", onUp)
	}, [fL, fR, xToYear, yearMin, yearMax, onFilterRangeChange])

	// ── Track click / double-click ────────────────────────────────────────────
	const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
		const year = xToYear(e.clientX)
		const half = (rightYear - leftYear) / 2
		const newL = Math.max(yearMin, year - half)
		const newR = Math.min(yearMax, newL + (rightYear - leftYear))
		onYearRangeChange([newL, newR])
	}, [xToYear, leftYear, rightYear, yearMin, yearMax, onYearRangeChange])

	const handleDblClick = useCallback((e: React.MouseEvent) => {
		e.stopPropagation()
		onYearRangeChange([yearMin, yearMax])
	}, [yearMin, yearMax, onYearRangeChange])

	// ── Derived positions ─────────────────────────────────────────────────────
	const tabCenterPct  = ((leftFrac + rightFrac) / 2) * 100
	const knobCenterPct = ((fLeftFrac + fRightFrac) / 2) * 100
	const trackMid      = TRACK_Y + TRACK_H / 2

	return (
		<div className="relative" style={{ height: TOTAL_H }}>

			{/* ── SVG: density bars + track + bar fills ────────────────────── */}
			<svg
				ref={svgRef}
				className="w-full cursor-pointer"
				height={TOTAL_H}
				style={{ display: "block" }}
				onClick={handleClick}
				onDoubleClick={handleDblClick}
			>
				{/* Density histogram */}
				{bucketCounts.map((count, i) => {
					const barH   = (count / maxCount) * DENSITY_H
					const xPct   = (i / NUM_BUCKETS) * 100
					const wPct   = (1 / NUM_BUCKETS) * 100
					const bLeft  = i / NUM_BUCKETS
					const bRight = (i + 1) / NUM_BUCKETS
					const inView = bLeft >= leftFrac - 0.01 && bRight <= rightFrac + 0.01
					const bYearL = Math.round(yearMin + bLeft  * domainSpan)
					const bYearR = Math.round(yearMin + bRight * domainSpan)
					const n      = rawCounts[i]
					return (
						<rect key={i}
							x={`${xPct}%`} y={TRACK_Y - barH}
							width={`${wPct}%`} height={Math.max(barH, 2)}
							fill={inView ? "var(--interactive-accent)" : "var(--text-faint)"}
							opacity={barH > 0 ? (inView ? 0.55 : 0.2) : 0}
						>
							<title>{`${bYearL} – ${bYearR}: ${n} event${n !== 1 ? "s" : ""}`}</title>
						</rect>
					)
				})}

				{/* Gray track */}
				<rect x={0} y={TRACK_Y} width="100%" height={TRACK_H}
					rx={3} fill="var(--background-modifier-border)" />

				{/* Filter bar fill — behind view box */}
				{hasFilter && (
					<rect
						x={`${fLeftFrac * 100}%`}
						y={TRACK_Y + 1}
						width={`${Math.max(0.5, (fRightFrac - fLeftFrac) * 100)}%`}
						height={TRACK_H - 2}
						rx={2}
						fill="var(--text-muted)"
						opacity={0.3}
					>
						<title>{`Filter: ${Math.round(fL)} – ${Math.round(fR)}`}</title>
					</rect>
				)}

				{/* View box fill */}
				<rect
					x={`${leftFrac * 100}%`}
					y={TRACK_Y}
					width={`${Math.max(0.5, (rightFrac - leftFrac) * 100)}%`}
					height={TRACK_H}
					rx={2}
					fill="var(--interactive-accent)"
					opacity={0.55}
				>
					<title>{`Viewing: ${Math.round(leftYear)} – ${Math.round(rightYear)}`}</title>
				</rect>

				{/* "Now" marker */}
				{NOW_YEAR >= yearMin && NOW_YEAR <= yearMax && (
					<line
						x1={`${((NOW_YEAR - yearMin) / domainSpan) * 100}%`} y1={TRACK_Y}
						x2={`${((NOW_YEAR - yearMin) / domainSpan) * 100}%`} y2={TRACK_Y + TRACK_H}
						stroke="var(--text-faint)" strokeWidth={1} opacity={0.5}
					/>
				)}

				{/* Year labels */}
				<text x={2} y={TOTAL_H - 1}
					fontSize={8} fill="var(--text-faint)" fontFamily="var(--font-monospace)">
					{Math.round(yearMin)}
				</text>
				<text x="99%" y={TOTAL_H - 1}
					fontSize={8} fill="var(--text-faint)" fontFamily="var(--font-monospace)" textAnchor="end">
					{Math.round(yearMax)}
				</text>
			</svg>

			{/* ── View box: top tab (pan) ───────────────────────────────────── */}
			<div
				style={{
					position:     "absolute",
					left:         `${tabCenterPct}%`,
					top:          TRACK_Y - TAB_H,
					transform:    "translateX(-50%)",
					width:        TAB_W,
					height:       TAB_H,
					background:   "var(--interactive-accent)",
					borderRadius: "3px 3px 0 0",
					cursor:       "grab",
					zIndex:       4,
					opacity:      0.85,
				}}
				onMouseDown={startBarDrag}
				onClick={e => e.stopPropagation()}
				onDoubleClick={handleDblClick}
			/>

			{/* ── View box: diamond edge handles (resize) ───────────────────── */}
			{(["left", "right"] as const).map(side => (
				<div
					key={`vb-${side}`}
					style={{
						position:  "absolute",
						left:      `${(side === "left" ? leftFrac : rightFrac) * 100}%`,
						top:       trackMid - DIAMOND / 2,
						transform: "translateX(-50%)",
						width:     DIAMOND,
						height:    DIAMOND,
						background:  "var(--interactive-accent)",
						clipPath:  "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
						cursor:    "ew-resize",
						zIndex:    5,
					}}
					onMouseDown={startDrag(side)}
					onClick={e => e.stopPropagation()}
					onDoubleClick={handleDblClick}
				/>
			))}

			{/* ── Filter bar: dot edge handles (resize) ─────────────────────── */}
			{hasFilter && (["left", "right"] as const).map(side => (
				<div
					key={`fb-${side}`}
					style={{
						position:     "absolute",
						left:         `${(side === "left" ? fLeftFrac : fRightFrac) * 100}%`,
						top:          TRACK_Y + 1,
						transform:    "translateX(-50%)",
						width:        6,
						height:       TRACK_H - 2,
						background:   "var(--text-muted)",
						borderRadius: 2,
						opacity:      0.75,
						cursor:       "ew-resize",
						zIndex:       4,
					}}
					onMouseDown={startFilterDrag(side)}
					onClick={e => e.stopPropagation()}
				/>
			))}

			{/* ── Filter bar: bottom knob (pan) ─────────────────────────────── */}
			{hasFilter && (
				<div
					style={{
						position:     "absolute",
						left:         `${knobCenterPct}%`,
						top:          TRACK_Y + TRACK_H + 2,
						transform:    "translateX(-50%)",
						width:        KNOB_R * 2,
						height:       KNOB_R * 2,
						borderRadius: "50%",
						border:       "1.5px solid var(--text-muted)",
						background:   "var(--background-primary)",
						cursor:       "grab",
						zIndex:       4,
					}}
					onMouseDown={startFilterBarDrag}
					onClick={e => e.stopPropagation()}
					onDoubleClick={handleDblClick}
				/>
			)}
		</div>
	)
}
