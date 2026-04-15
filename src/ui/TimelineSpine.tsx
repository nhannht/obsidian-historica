import React, { useCallback, useEffect, useRef, useState } from "react"
import { zoom as d3zoom, zoomIdentity, ZoomTransform, ZoomBehavior, D3ZoomEvent } from "d3-zoom"
import { select } from "d3-selection"
import { useD3TimelineEngine, BASE_HEIGHT } from "@/src/store/useD3TimelineEngine"
import { SinglePlotUnit } from "@/src/ui/SinglePlotUnit"
import { useTimelineStore } from "@/src/ui/TimelineContext"
import { TimelineMinimap } from "@/src/ui/TimelineMinimap"

const AXIS_WIDTH = 80   // px reserved for the left SVG axis
const CARD_OFFSET = 8   // gap between axis and cards
const VIEWPORT_H = 600  // visible height in px; zoom/pan navigates within

export function TimelineSpine({ isSingleFile }: { isSingleFile: boolean }) {
	const units     = useTimelineStore(s => s.units)
	const showHidden = useTimelineStore(s => s.showHidden)

	const [zoomK, setZoomK]                = useState(1)
	const [transform, setTransform]         = useState<ZoomTransform>(zoomIdentity)
	const [zoomBehavior, setZoomBehavior]   = useState<ZoomBehavior<HTMLDivElement, unknown> | null>(null)
	const containerRef                      = useRef<HTMLDivElement>(null)

	const engine = useD3TimelineEngine(units, showHidden, true, zoomK)

	// Attach d3.zoom — wheel = zoom, drag = pan
	// Initial translate: pan so bottom of BASE_HEIGHT is visible (recent events first)
	useEffect(() => {
		const el = containerRef.current
		if (!el) return
		const zoom = d3zoom<HTMLDivElement, unknown>()
			.scaleExtent([1, 1e9])
			.on("zoom", (event: D3ZoomEvent<HTMLDivElement, unknown>) => {
				setTransform(event.transform)
				setZoomK(event.transform.k)
			})
		setZoomBehavior(() => zoom)
		// Start view at bottom (present day), not top (Big Bang)
		const initialY = -(BASE_HEIGHT - VIEWPORT_H)
		const initial = zoomIdentity.translate(0, initialY)
		select(el).call(zoom).call(zoom.transform, initial)
		return () => { select(el).on(".zoom", null) }
	}, [])

	// Convert base-space y [0, BASE_HEIGHT] → screen y
	const toScreenY = useCallback(
		(y: number) => transform.applyY(y),
		[transform],
	)

	return (
		<div className="flex flex-col">
		{/* ── Minimap strip ────────────────────────────────────────────── */}
		{zoomBehavior && (
			<div className="px-2 py-1 border-b border-[--background-modifier-border]">
				<TimelineMinimap
					transform={transform}
					viewportH={VIEWPORT_H}
					zoomTargetRef={containerRef as React.RefObject<HTMLDivElement>}
					zoomBehavior={zoomBehavior}
				/>
			</div>
		)}
		<div
			ref={containerRef}
			className="relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
			style={{ height: VIEWPORT_H }}
		>
			{/* ── SVG axis spine ─────────────────────────────────────────── */}
			<svg
				className="absolute inset-0 pointer-events-none"
				width={AXIS_WIDTH}
				height={VIEWPORT_H}
			>
				{/* vertical line */}
				<line
					x1={AXIS_WIDTH - 1} y1={0}
					x2={AXIS_WIDTH - 1} y2={VIEWPORT_H}
					stroke="var(--background-modifier-border-hover)"
					strokeWidth={1}
				/>

				{/* tick marks + labels */}
				{engine.axisTicks.map((tick, i) => {
					const sy = toScreenY(tick.y)
					if (sy < -20 || sy > VIEWPORT_H + 20) return null
					return (
						<g key={i} transform={`translate(0,${sy})`}>
							<line
								x1={tick.isMajor ? AXIS_WIDTH - 12 : AXIS_WIDTH - 5}
								y1={0}
								x2={AXIS_WIDTH - 1}
								y2={0}
								stroke="var(--background-modifier-border)"
								strokeWidth={tick.isMajor ? 1.5 : 0.8}
								opacity={tick.isMajor ? 1 : 0.5}
							/>
							{tick.isMajor && (
								<text
									x={AXIS_WIDTH - 15}
									y={4}
									textAnchor="end"
									fontSize={9}
									fill="var(--text-faint)"
									fontFamily="var(--font-monospace)"
								>
									{tick.label}
								</text>
							)}
						</g>
					)
				})}

				{/* dot for each positioned entry */}
				{engine.positionedEntries.map(({ entry, y }) => {
					const sy = toScreenY(y)
					if (sy < -10 || sy > VIEWPORT_H + 10) return null
					const sig = entry.significance ?? (entry.isAnchor ? 3 : 1)
					const r = 2 + sig * 1.5
					const opacity = 0.35 + sig * 0.13
					return (
						<circle
							key={`dot-${entry.id}`}
							cx={AXIS_WIDTH - 1}
							cy={sy}
							r={r}
							fill={entry.isAnchor
								? "var(--color-accent)"
								: "var(--interactive-accent)"}
							opacity={opacity}
						/>
					)
				})}
			</svg>

			{/* ── Absolutely positioned cards ────────────────────────────── */}
			<div
				className="absolute top-0 bottom-0"
				style={{ left: AXIS_WIDTH + CARD_OFFSET, right: 0 }}
			>
				{engine.positionedEntries.map(({ entry, y }, idx) => {
					const sy = toScreenY(y)
					// Cull cards well outside the viewport
					if (sy < -150 || sy > VIEWPORT_H + 150) return null
					return (
						<div
							key={entry.id}
							className="absolute w-full"
							style={{ top: sy, transform: "translateY(-50%)" }}
						>
							<SinglePlotUnit
								unit={entry}
								index={idx}
								isSingleFile={isSingleFile}
							/>
						</div>
					)
				})}
			</div>

			{/* ── Undated / free entries ─────────────────────────────────── */}
			{engine.freeEntries.length > 0 && (
				<div
					className="absolute bottom-0 left-0 right-0 bg-[--background-primary] border-t border-[--background-modifier-border] px-2 pt-1"
					style={{ left: AXIS_WIDTH + CARD_OFFSET }}
				>
					<div className="text-[9px] uppercase tracking-widest text-[color:--text-faint] mb-1">
						Undated
					</div>
					{engine.freeEntries.map((entry, idx) => (
						<SinglePlotUnit
							key={entry.id}
							unit={entry}
							index={engine.positionedEntries.length + idx}
							isSingleFile={isSingleFile}
						/>
					))}
				</div>
			)}

			{/* ── LoD badge ─────────────────────────────────────────────── */}
			<div className="absolute top-1 right-1 text-[9px] text-[color:--text-faint] opacity-50 pointer-events-none font-mono">
				sig ≥ {engine.visibleMinSig} · {engine.positionedEntries.length} events
			</div>
		</div>
		</div>
	)
}
