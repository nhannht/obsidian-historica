/**
 * TimelineMinimap — thin horizontal strip showing current viewport position
 * within the full 13.8B year log-scale domain.
 *
 * Rendered at the top of TimelineSpine. Clicking anywhere on the minimap
 * jumps the main view to that position.
 */

import { useRef, useCallback } from "react"
import { ZoomTransform, ZoomBehavior, zoomIdentity } from "d3-zoom"
import { select } from "d3-selection"
import { yearToDomain, BASE_HEIGHT } from "@/src/store/useD3TimelineEngine"

const YEAR_MIN = -13_800_000_000   // Big Bang
const YEAR_MAX = new Date().getFullYear()
const DOMAIN_MIN = yearToDomain(YEAR_MIN)
const DOMAIN_MAX = yearToDomain(YEAR_MAX)

/** Maps a domain value [DOMAIN_MIN, DOMAIN_MAX] → minimap x [0, 1] */
function domainToMinimapX(domain: number): number {
	const logMin = Math.log10(DOMAIN_MIN)
	const logMax = Math.log10(DOMAIN_MAX)
	const logD   = Math.log10(Math.max(domain, 1))
	return (logD - logMin) / (logMax - logMin)
}

/** Maps a minimap x [0, 1] → domain value */
function minimapXToDomain(x: number): number {
	const logMin = Math.log10(DOMAIN_MIN)
	const logMax = Math.log10(DOMAIN_MAX)
	return Math.pow(10, logMin + x * (logMax - logMin))
}

/** Human-readable era labels for the minimap */
const ERA_LABELS = [
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
}

export function TimelineMinimap({ transform, viewportH, zoomTargetRef, zoomBehavior }: Props) {
	const stripRef = useRef<SVGSVGElement>(null)

	// Compute which y range [0, BASE_HEIGHT] is currently visible
	// screen y 0 → base y = (0 - transform.y) / transform.k
	// screen y viewportH → base y = (viewportH - transform.y) / transform.k
	const baseYTop    = (0 - transform.y) / transform.k
	const baseYBottom = (viewportH - transform.y) / transform.k

	// Convert base y positions to domain values via inverse of scale
	// scale maps domain [DOMAIN_MIN, DOMAIN_MAX] → y [0, BASE_HEIGHT]
	// Invert: domain = DOMAIN_MIN * (DOMAIN_MAX/DOMAIN_MIN)^(y/BASE_HEIGHT)
	function baseYToDomain(y: number): number {
		const t = Math.max(0, Math.min(1, y / BASE_HEIGHT))
		return DOMAIN_MIN * Math.pow(DOMAIN_MAX / DOMAIN_MIN, t)
	}

	const domainTop    = baseYToDomain(baseYTop)
	const domainBottom = baseYToDomain(baseYBottom)

	const viewLeft  = domainToMinimapX(Math.max(domainTop,    DOMAIN_MIN))
	const viewRight = domainToMinimapX(Math.min(domainBottom, DOMAIN_MAX))

	// Click → jump to that position
	const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
		const el = stripRef.current
		if (!el || !zoomTargetRef.current) return
		const rect  = el.getBoundingClientRect()
		const xFrac = (e.clientX - rect.left) / rect.width
		const clickedDomain = minimapXToDomain(xFrac)

		// Compute base y for clicked domain
		const t = Math.log(clickedDomain / DOMAIN_MIN) / Math.log(DOMAIN_MAX / DOMAIN_MIN)
		const targetBaseY = t * BASE_HEIGHT

		// Pan so targetBaseY appears at viewport center
		const newY = viewportH / 2 - transform.k * targetBaseY
		const newTransform = zoomIdentity.translate(0, newY).scale(transform.k)
		select(zoomTargetRef.current).call(zoomBehavior.transform, newTransform)
	}, [transform, viewportH, zoomTargetRef, zoomBehavior])

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

			{/* era labels */}
			{ERA_LABELS.map(({ year, label }) => {
				const x = domainToMinimapX(yearToDomain(year)) * 100
				return (
					<text
						key={label}
						x={`${x}%`}
						y={6}
						fontSize={7}
						fill="var(--text-faint)"
						textAnchor="middle"
					>
						{label}
					</text>
				)
			})}

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

			{/* "now" tick */}
			<line
				x1={`${domainToMinimapX(yearToDomain(YEAR_MAX)) * 100}%`}
				y1={8} x2={`${domainToMinimapX(yearToDomain(YEAR_MAX)) * 100}%`} y2={14}
				stroke="var(--text-faint)" strokeWidth={1} opacity={0.4}
			/>
		</svg>
	)
}
