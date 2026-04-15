import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { zoom as d3zoom, zoomIdentity, zoomTransform, ZoomTransform, ZoomBehavior, D3ZoomEvent } from "d3-zoom"
import { select } from "d3-selection"
import { useD3TimelineEngine, BASE_HEIGHT } from "@/src/store/useD3TimelineEngine"
import { SinglePlotUnit } from "@/src/ui/SinglePlotUnit"
import { useTimelineStore } from "@/src/ui/TimelineContext"
import { TimelineMinimap } from "@/src/ui/TimelineMinimap"
import { BIG_HISTORY_ERAS } from "@/src/data/bigHistoryAnchors"

const AXIS_WIDTH = 80   // px reserved for the left SVG axis
const CARD_OFFSET = 8   // gap between axis and cards
const VIEWPORT_H = 600  // visible height in px; zoom/pan navigates within

export function TimelineSpine({ isSingleFile }: { isSingleFile: boolean }) {
	const units      = useTimelineStore(s => s.units)
	const showHidden = useTimelineStore(s => s.showHidden)
	const sigFilter  = useTimelineStore(s => s.sigFilter)

	const [transform, setTransform]         = useState<ZoomTransform>(zoomIdentity)
	const [zoomBehavior, setZoomBehavior]   = useState<ZoomBehavior<HTMLDivElement, unknown> | null>(null)
	const [expandedEras, setExpandedEras]   = useState<Set<string>>(
		() => new Set(BIG_HISTORY_ERAS.map(e => e.id))
	)
	const containerRef = useRef<HTMLDivElement>(null)

	const engine = useD3TimelineEngine(units, showHidden, transform.k)

	const toggleEra = useCallback((id: string) => {
		setExpandedEras(prev => {
			const next = new Set(prev)
			next.has(id) ? next.delete(id) : next.add(id)
			return next
		})
	}, [])

	useEffect(() => {
		const el = containerRef.current
		if (!el) return
		const zoom = d3zoom<HTMLDivElement, unknown>()
			.scaleExtent([1, 1e9])
			// plain wheel = pan only; ctrl+wheel = zoom (industry standard for vertical timelines)
			.filter(event => event.type === "wheel" ? event.ctrlKey : true)
			.on("zoom", (event: D3ZoomEvent<HTMLDivElement, unknown>) => {
				setTransform(event.transform)
			})
		setZoomBehavior(() => zoom)
		select(el).call(zoom).call(zoom.transform, zoomIdentity)

		const onWheel = (e: WheelEvent) => {
			if (e.ctrlKey) return   // let d3 handle ctrl+wheel zoom
			e.preventDefault()
			const t = zoomTransform(el)
			const minY = -(t.k - 1) * BASE_HEIGHT
			const clampedY = Math.max(minY, Math.min(0, t.y - e.deltaY))
			select(el).call(zoom.transform, zoomIdentity.translate(0, clampedY).scale(t.k))
		}
		el.addEventListener("wheel", onWheel, { passive: false })

		return () => {
			select(el).on(".zoom", null)
			el.removeEventListener("wheel", onWheel)
		}
	}, [])

	const toScreenY = useCallback(
		(y: number) => transform.applyY(y),
		[transform],
	)

	const visibleEntries = useMemo(
		() => engine.positionedEntries.filter(({ entry }) => {
			const sig = entry.significance ?? (entry.isAnchor ? 3 : 1)
			if (sig < sigFilter) return false
			return !entry.eraId || expandedEras.has(entry.eraId)
		}),
		[engine.positionedEntries, expandedEras, sigFilter],
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
					yearMin={engine.yearMin}
					yearMax={engine.yearMax}
					positionedEntries={engine.positionedEntries}
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
				<line
					x1={AXIS_WIDTH - 1} y1={0}
					x2={AXIS_WIDTH - 1} y2={VIEWPORT_H}
					stroke="var(--background-modifier-border)"
					strokeWidth={2}
				/>

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
									y={5}
									textAnchor="end"
									fontSize={11}
									fill="var(--text-muted)"
									fontFamily="var(--font-monospace)"
								>
									{tick.label}
								</text>
							)}
						</g>
					)
				})}

				{visibleEntries.map(({ entry, y }) => {
					const sy = toScreenY(y)
					if (sy < -10 || sy > VIEWPORT_H + 10) return null
					const sig = entry.significance ?? (entry.isAnchor ? 3 : 1)
					const r = 3 + sig * 1.5
					const opacity = 0.55 + sig * 0.09
					const fill = entry.isAnchor ? "var(--text-faint)" : "var(--interactive-accent)"
					return (
						<g key={`dot-${entry.id}`}>
							{!entry.isAnchor && (
								<circle cx={AXIS_WIDTH - 1} cy={sy} r={r + 4}
									fill="var(--interactive-accent)" opacity={0.12} />
							)}
							<circle cx={AXIS_WIDTH - 1} cy={sy} r={r}
								fill={fill} opacity={opacity} />
						</g>
					)
				})}
			</svg>

			{/* ── Era boundary markers (clickable) ───────────────────────── */}
			{BIG_HISTORY_ERAS
				.filter(era => era.startYear >= engine.yearMin && era.startYear <= engine.yearMax)
				.map(era => {
				const eraBaseY = engine.scale(era.startYear) as number
				const sy = toScreenY(eraBaseY)
				if (sy < -16 || sy > VIEWPORT_H + 4) return null
				const isExpanded = expandedEras.has(era.id)
				return (
					<div
						key={era.id}
						className="absolute left-0 right-0 z-10 flex items-center cursor-pointer"
						style={{ top: sy - 8 }}
						onClick={e => { e.stopPropagation(); toggleEra(era.id) }}
					>
						<div
							className="absolute h-0.5 bg-[--background-modifier-border]"
							style={{ left: AXIS_WIDTH, right: 0 }}
						/>
						<div
							className="absolute flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[--background-modifier-border] text-[11px] font-semibold uppercase tracking-wider bg-[--background-secondary] text-[color:--text-muted] hover:text-[color:--text-normal] transition-colors"
							style={{ left: AXIS_WIDTH + CARD_OFFSET }}
						>
							<span>{isExpanded ? "▼" : "▶"}</span>
							<span>{era.label}</span>
						</div>
					</div>
				)
			})}

			{/* ── Absolutely positioned cards (with collision avoidance) ─── */}
			<div
				className="absolute top-0 bottom-0"
				style={{ left: AXIS_WIDTH + CARD_OFFSET, right: 0 }}
			>
				{(() => {
					const MIN_CARD_GAP = 28
					let lastSy = -Infinity
					return visibleEntries.map(({ entry, y }, idx) => {
						const rawSy = toScreenY(y)
						const sy = Math.max(rawSy, lastSy + MIN_CARD_GAP)
						lastSy = sy
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
					})
				})()}
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
							index={visibleEntries.length + idx}
							isSingleFile={isSingleFile}
						/>
					))}
				</div>
			)}

			{/* ── LoD badge ─────────────────────────────────────────────── */}
			<div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono text-[color:--text-muted] bg-[--background-secondary] border border-[--background-modifier-border] opacity-80 pointer-events-none">
				sig ≥ {engine.visibleMinSig} · {visibleEntries.length} events
			</div>
		</div>
		</div>
	)
}
