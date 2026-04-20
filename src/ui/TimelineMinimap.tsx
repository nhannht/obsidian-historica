/**
 * TimelineMinimap — horizontal strip with:
 *   - density histogram (event count per time bucket)
 *   - draggable range handles to filter the visible time window
 *
 * Clicking outside the selected range pans it to center on the clicked point.
 * Double-clicking resets to full range.
 */

import { useRef, useCallback, useMemo } from "react"
import { BASE_HEIGHT } from "@/src/store/useD3TimelineEngine"
import { entrySig } from "@/src/utils"

const NUM_BUCKETS  = 30
const DENSITY_H    = 16   // max bar height in px
const TRACK_Y      = 20   // y where the track starts
const TRACK_H      = 6    // track height
const HANDLE_W     = 8    // handle width in px
const LABEL_H      = 12    // space for year labels below track
const TOTAL_H      = TRACK_Y + TRACK_H + LABEL_H
const NOW_YEAR     = new Date().getFullYear()

interface Props {
	/** Earliest year of the active domain */
	yearMin: number
	/** Latest year of the active domain */
	yearMax: number
	/** Current selected range [leftYear, rightYear] */
	yearRange: [number, number]
	/** Called when the user drags a handle or clicks to pan */
	onYearRangeChange: (range: [number, number]) => void
	/** All positioned entries — used for density histogram */
	positionedEntries: Array<{ entry: import("@/src/types").TimelineEntry; y: number }>
}

export function TimelineMinimap({
	yearMin,
	yearMax,
	yearRange,
	onYearRangeChange,
	positionedEntries,
}: Props) {
	const svgRef    = useRef<SVGSVGElement>(null)
	const domainSpan = yearMax - yearMin

	const [leftYear, rightYear] = yearRange
	const leftFrac  = domainSpan > 0 ? (leftYear  - yearMin) / domainSpan : 0
	const rightFrac = domainSpan > 0 ? (rightYear - yearMin) / domainSpan : 1

	const { bucketCounts, rawCounts, maxCount } = useMemo(() => {
		const counts = new Array(NUM_BUCKETS).fill(0)
		const raw    = new Array(NUM_BUCKETS).fill(0)
		for (const { entry, y } of positionedEntries) {
			if (entry.isAnchor) continue
			const frac   = Math.max(0, Math.min(1, y / BASE_HEIGHT))
			const bucket = Math.min(NUM_BUCKETS - 1, Math.floor(frac * NUM_BUCKETS))
			counts[bucket] += 1 + entrySig(entry) * 0.5
			raw[bucket] += 1
		}
		return { bucketCounts: counts, rawCounts: raw, maxCount: Math.max(1, ...counts) }
	}, [positionedEntries])

	const xToYear = useCallback((clientX: number): number => {
		const el = svgRef.current
		if (!el) return yearMin
		const rect = el.getBoundingClientRect()
		const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
		return yearMin + frac * domainSpan
	}, [yearMin, domainSpan])

	const startDrag = useCallback((which: "left" | "right") => (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		// Capture range at drag start so onMove clamps correctly
		const capturedLeft  = leftYear
		const capturedRight = rightYear

		const onMove = (ev: MouseEvent) => {
			const year = xToYear(ev.clientX)
			if (which === "left") {
				onYearRangeChange([Math.min(year, capturedRight - 1), capturedRight])
			} else {
				onYearRangeChange([capturedLeft, Math.max(year, capturedLeft + 1)])
			}
		}
		const onUp = () => {
			window.removeEventListener("mousemove", onMove)
			window.removeEventListener("mouseup", onUp)
		}
		window.addEventListener("mousemove", onMove)
		window.addEventListener("mouseup", onUp)
	}, [leftYear, rightYear, xToYear, onYearRangeChange])

	// Center-drag: drag the bar itself to slide the entire range window
	const startBarDrag = useCallback((e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		const startYear = xToYear(e.clientX)
		const rangeWidth = rightYear - leftYear
		const capturedLeft = leftYear

		const onMove = (ev: MouseEvent) => {
			const currentYear = xToYear(ev.clientX)
			const delta = currentYear - startYear
			let newL = capturedLeft + delta
			let newR = newL + rangeWidth
			// Clamp to domain bounds
			if (newL < yearMin) { newL = yearMin; newR = yearMin + rangeWidth }
			if (newR > yearMax) { newR = yearMax; newL = yearMax - rangeWidth }
			onYearRangeChange([newL, newR])
		}
		const onUp = () => {
			window.removeEventListener("mousemove", onMove)
			window.removeEventListener("mouseup", onUp)
		}
		window.addEventListener("mousemove", onMove)
		window.addEventListener("mouseup", onUp)
	}, [leftYear, rightYear, xToYear, yearMin, yearMax, onYearRangeChange])

	const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
		const year   = xToYear(e.clientX)
		const half   = (rightYear - leftYear) / 2
		const newL   = Math.max(yearMin, year - half)
		const newR   = Math.min(yearMax, newL + (rightYear - leftYear))
		onYearRangeChange([newL, newR])
	}, [xToYear, leftYear, rightYear, yearMin, yearMax, onYearRangeChange])

	const handleDblClick = useCallback((e: React.MouseEvent) => {
		e.stopPropagation()
		onYearRangeChange([yearMin, yearMax])
	}, [yearMin, yearMax, onYearRangeChange])

	return (
		<div className="relative" style={{ height: TOTAL_H }}>
			<svg
				ref={svgRef}
				className="w-full cursor-pointer"
				height={TOTAL_H}
				style={{ display: "block" }}
				onClick={handleClick}
				onDoubleClick={handleDblClick}
			>
				{bucketCounts.map((count, i) => {
					const barH   = (count / maxCount) * DENSITY_H
					const xPct   = (i / NUM_BUCKETS) * 100
					const wPct   = (1 / NUM_BUCKETS) * 100
					const bLeft  = i / NUM_BUCKETS
					const bRight = (i + 1) / NUM_BUCKETS
					const inRange = bLeft >= leftFrac - 0.01 && bRight <= rightFrac + 0.01
					const bYearL = Math.round(yearMin + bLeft * domainSpan)
					const bYearR = Math.round(yearMin + bRight * domainSpan)
					const n = rawCounts[i]
					return (
						<rect key={i}
							x={`${xPct}%`}
							y={TRACK_Y - barH}
							width={`${wPct}%`}
							height={Math.max(barH, 2)}
							fill={inRange ? "var(--interactive-accent)" : "var(--text-faint)"}
							opacity={barH > 0 ? (inRange ? 0.55 : 0.2) : 0}
						>
							<title>{`${bYearL} – ${bYearR}: ${n} event${n !== 1 ? "s" : ""}`}</title>
						</rect>
					)
				})}

				<rect x={0} y={TRACK_Y} width="100%" height={TRACK_H}
					rx={3} fill="var(--background-modifier-border)" />

				<rect
					x={`${leftFrac * 100}%`}
					y={TRACK_Y}
					width={`${Math.max(0.5, (rightFrac - leftFrac) * 100)}%`}
					height={TRACK_H}
					rx={2}
					fill="var(--interactive-accent)"
					opacity={0.6}
				>
					<title>{`Viewing: ${Math.round(leftYear)} – ${Math.round(rightYear)}`}</title>
				</rect>

				{/* Year labels */}
				<text x={2} y={TRACK_Y + TRACK_H + 10} fontSize={8} fill="var(--text-faint)" fontFamily="var(--font-monospace)">
					{Math.round(yearMin)}
				</text>
				<text x="99%" y={TRACK_Y + TRACK_H + 10} fontSize={8} fill="var(--text-faint)" fontFamily="var(--font-monospace)" textAnchor="end">
					{Math.round(yearMax)}
				</text>

				{NOW_YEAR >= yearMin && NOW_YEAR <= yearMax && (
					<line
						x1={`${((NOW_YEAR - yearMin) / domainSpan) * 100}%`}
						y1={TRACK_Y}
						x2={`${((NOW_YEAR - yearMin) / domainSpan) * 100}%`}
						y2={TRACK_Y + TRACK_H}
						stroke="var(--text-faint)"
						strokeWidth={1}
						opacity={0.5}
					/>
				)}
			</svg>

			{/* Center-drag bar overlay — sits between the two handles */}
			<div
				style={{
					position: "absolute",
					left: `${leftFrac * 100}%`,
					top: TRACK_Y - 2,
					width: `${Math.max(0.5, (rightFrac - leftFrac) * 100)}%`,
					height: TRACK_H + 4,
					cursor: "grab",
					zIndex: 1,
				}}
				onMouseDown={startBarDrag}
				onClick={e => e.stopPropagation()}
				onDoubleClick={handleDblClick}
			/>

			{(["left", "right"] as const).map(side => (
				<div
					key={side}
					style={{
						position:    "absolute",
						left:        `${(side === "left" ? leftFrac : rightFrac) * 100}%`,
						top:         TRACK_Y - 2,
						transform:   "translateX(-50%)",
						width:       HANDLE_W,
						height:      TRACK_H + 4,
						background:  "var(--interactive-accent)",
						borderRadius: 3,
						cursor:      "ew-resize",
						zIndex:      2,
					}}
					onMouseDown={startDrag(side)}
					onClick={e => e.stopPropagation()}
					onDoubleClick={handleDblClick}
				/>
			))}
		</div>
	)
}
