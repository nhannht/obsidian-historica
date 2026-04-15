/**
 * TimelineMinimap — thin horizontal strip showing current viewport position
 * within the dynamic linear domain computed from user data.
 *
 * Rendered at the top of TimelineSpine. Clicking anywhere on the minimap
 * jumps the main view to that position.
 */

import { useRef, useCallback } from "react"
import { ZoomTransform, ZoomBehavior, zoomIdentity } from "d3-zoom"
import { select } from "d3-selection"
import { BASE_HEIGHT } from "@/src/store/useD3TimelineEngine"

/** Era labels shown on the minimap — filtered to those within the active domain */
const ALL_ERA_LABELS = [
	{ year: -13_800_000_000, label: "Big Bang" },
	{ year:  -4_500_000_000, label: "Earth" },
	{ year:    -541_000_000, label: "Life" },
	{ year:      -2_500_000, label: "Humanity" },
	{ year:          -3_000, label: "Ancient" },
	{ year:           1_500, label: "Modern" },
]

interface Props {
	/** Current d3 zoom transform */
	transform: ZoomTransform
	/** Viewport height in px — used to compute visible year range */
	viewportH: number
	/** Zoom element ref — used to programmatically zoom on click */
	zoomTargetRef: React.RefObject<HTMLDivElement>
	/** d3.zoom behavior instance */
	zoomBehavior: ZoomBehavior<HTMLDivElement, unknown>
	/** Earliest year of the active domain (from engine) */
	yearMin: number
	/** Latest year of the active domain (from engine) */
	yearMax: number
}

export function TimelineMinimap({
	transform,
	viewportH,
	zoomTargetRef,
	zoomBehavior,
	yearMin,
	yearMax,
}: Props) {
	const stripRef   = useRef<SVGSVGElement>(null)
	const domainSpan = yearMax - yearMin

	/** Calendar year → minimap x fraction [0, 1] */
	function yearToMinimapX(year: number): number {
		return (year - yearMin) / domainSpan
	}

	/** Minimap x fraction [0, 1] → calendar year */
	function minimapXToYear(x: number): number {
		return yearMin + x * domainSpan
	}

	/** Base-space y [0, BASE_HEIGHT] → calendar year (linear inverse of scale) */
	function baseYToYear(y: number): number {
		const t = Math.max(0, Math.min(1, y / BASE_HEIGHT))
		return yearMin + t * domainSpan
	}

	const baseYTop    = (0 - transform.y) / transform.k
	const baseYBottom = (viewportH - transform.y) / transform.k

	const yearTop    = baseYToYear(baseYTop)
	const yearBottom = baseYToYear(baseYBottom)

	const viewLeft  = yearToMinimapX(Math.max(yearTop,    yearMin))
	const viewRight = yearToMinimapX(Math.min(yearBottom, yearMax))

	const eraLabels = ALL_ERA_LABELS.filter(
		({ year }) => year >= yearMin && year <= yearMax
	)

	const nowYear = new Date().getFullYear()

	const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
		const el = stripRef.current
		if (!el || !zoomTargetRef.current) return
		const rect       = el.getBoundingClientRect()
		const xFrac      = (e.clientX - rect.left) / rect.width
		const clickedYear = minimapXToYear(xFrac)
		const targetBaseY = yearToMinimapX(clickedYear) * BASE_HEIGHT
		const newY        = viewportH / 2 - transform.k * targetBaseY
		const newTransform = zoomIdentity.translate(0, newY).scale(transform.k)
		select(zoomTargetRef.current).call(zoomBehavior.transform, newTransform)
	}, [transform, viewportH, zoomTargetRef, zoomBehavior, yearMin, yearMax])

	return (
		<svg
			ref={stripRef}
			className="w-full cursor-pointer"
			height={28}
			onClick={handleClick}
			style={{ display: "block" }}
		>
			{/* background track */}
			<rect x={0} y={8} width="100%" height={6}
				rx={3} fill="var(--background-modifier-border)" />

			{/* era labels within domain */}
			{eraLabels.map(({ year, label }) => (
				<text
					key={label}
					x={`${yearToMinimapX(year) * 100}%`}
					y={6}
					fontSize={7}
					fill="var(--text-faint)"
					textAnchor="middle"
				>
					{label}
				</text>
			))}

			{/* viewport indicator */}
			<rect
				x={`${viewLeft * 100}%`}
				y={7}
				width={`${Math.max(0.5, (viewRight - viewLeft) * 100)}%`}
				height={8}
				rx={2}
				fill="var(--interactive-accent)"
				opacity={0.6}
			/>

			{/* "now" tick — only when today is within the domain */}
			{nowYear >= yearMin && nowYear <= yearMax && (
				<line
					x1={`${yearToMinimapX(nowYear) * 100}%`}
					y1={8}
					x2={`${yearToMinimapX(nowYear) * 100}%`}
					y2={14}
					stroke="var(--text-faint)"
					strokeWidth={1}
					opacity={0.4}
				/>
			)}
		</svg>
	)
}
