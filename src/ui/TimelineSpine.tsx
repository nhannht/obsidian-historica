import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { zoom as d3zoom, zoomIdentity, ZoomBehavior, D3ZoomEvent } from "d3-zoom"
import { select } from "d3-selection"
import { useD3TimelineEngine } from "@/src/store/useD3TimelineEngine"
import { SinglePlotUnit } from "@/src/ui/SinglePlotUnit"
import { useTimelineStore } from "@/src/ui/TimelineContext"
import { TimelineMinimap } from "@/src/ui/TimelineMinimap"
import { BIG_HISTORY_ERAS } from "@/src/data/bigHistoryAnchors"
import { useVirtualizer } from "@tanstack/react-virtual"
import { entrySig } from "@/src/utils"

const AXIS_WIDTH  = 80    // px reserved for the left SVG axis
const CARD_OFFSET = 8     // gap between axis and cards
const VIEWPORT_H  = 600   // visible height in px

export function TimelineSpine({ isSingleFile }: { isSingleFile: boolean }) {
	const units      = useTimelineStore(s => s.units)
	const showHidden = useTimelineStore(s => s.showHidden)
	const sigFilter  = useTimelineStore(s => s.sigFilter)

	const [zoomK, setZoomK]               = useState(1)
	const [scrollTop, setScrollTop]       = useState(0)
	const [zoomBehavior, setZoomBehavior] = useState<ZoomBehavior<HTMLDivElement, unknown> | null>(null)
	const [expandedEras, setExpandedEras] = useState<Set<string>>(
		() => new Set(BIG_HISTORY_ERAS.map(e => e.id))
	)

	const containerRef       = useRef<HTMLDivElement>(null)
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const zoomKRef           = useRef(1)  // stale-closure escape hatch for zoom handler

	const engine = useD3TimelineEngine(units, showHidden, zoomK)

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
			// Only ctrl+wheel triggers zoom — plain wheel handled below for native scroll
			.filter(event => event.type === "wheel" && (event as WheelEvent).ctrlKey)
			.on("zoom", (event: D3ZoomEvent<HTMLDivElement, unknown>) => {
				const newK = event.transform.k
				const oldK = zoomKRef.current
				// Adjust scroll so the point under the cursor stays fixed during zoom
				if (newK !== oldK && scrollContainerRef.current) {
					const sc       = scrollContainerRef.current
					const cursorY  = (event.sourceEvent as MouseEvent)?.offsetY ?? VIEWPORT_H / 2
					const baseYAtCursor = (cursorY + sc.scrollTop) / oldK
					sc.scrollTop = Math.max(0, newK * baseYAtCursor - cursorY)
				}
				zoomKRef.current = newK
				setZoomK(newK)
			})

		setZoomBehavior(() => zoom)
		select(el).call(zoom).call(zoom.transform, zoomIdentity)

		// Plain wheel → native scroll on card container (ctrl+wheel handled by D3 above)
		const onWheel = (e: WheelEvent) => {
			if (e.ctrlKey) return
			e.preventDefault()
			if (scrollContainerRef.current) {
				const sc       = scrollContainerRef.current
				const maxScroll = sc.scrollHeight - sc.clientHeight
				sc.scrollTop   = Math.max(0, Math.min(maxScroll, sc.scrollTop + e.deltaY))
			}
		}
		el.addEventListener("wheel", onWheel, { passive: false })

		return () => {
			select(el).on(".zoom", null)
			el.removeEventListener("wheel", onWheel)
		}
	}, [])

	// toScreenY maps base-space y [0, BASE_HEIGHT] → screen px relative to container top
	const toScreenY = useCallback(
		(y: number) => zoomK * y - scrollTop,
		[zoomK, scrollTop],
	)

	const visibleEntries = useMemo(
		() => engine.positionedEntries.filter(({ entry }) => {
			const sig = entrySig(entry)
			if (sig < sigFilter) return false
			return !entry.eraId || expandedEras.has(entry.eraId)
		}),
		[engine.positionedEntries, expandedEras, sigFilter],
	)

	// Virtualizer — dynamic height measurement via measureElement (ResizeObserver internally)
	const virtualizer = useVirtualizer({
		count:          visibleEntries.length,
		getScrollElement: () => scrollContainerRef.current,
		estimateSize:   (i) => visibleEntries[i]?.entry.isExpanded ? 240 : 24,
		measureElement: (el) => el.getBoundingClientRect().height,
		getItemKey:     (i) => visibleEntries[i]?.entry.id ?? i,
		overscan:       3,
	})

	return (
		<div className="flex flex-col">
			{/* ── Minimap strip ────────────────────────────────────────────── */}
			{zoomBehavior && (
				<div className="px-2 py-1 border-b border-[--background-modifier-border]">
					<TimelineMinimap
						scrollTop={scrollTop}
						zoomK={zoomK}
						viewportH={VIEWPORT_H}
						scrollContainerRef={scrollContainerRef}
						yearMin={engine.yearMin}
						yearMax={engine.yearMax}
						positionedEntries={engine.positionedEntries}
					/>
				</div>
			)}

			<div
				ref={containerRef}
				className="relative overflow-hidden select-none"
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
						const sig     = entrySig(entry)
						const r       = 3 + sig * 1.5
						const opacity = 0.55 + sig * 0.09
						const fill    = entry.isAnchor ? "var(--text-faint)" : "var(--interactive-accent)"
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
						const eraBaseY  = engine.scale(era.startYear) as number
						const sy        = toScreenY(eraBaseY)
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

				{/* ── Virtualized card list ──────────────────────────────────── */}
				<div
					ref={scrollContainerRef}
					className="absolute top-0 bottom-0 overflow-y-auto historica-no-scrollbar"
					style={{ left: AXIS_WIDTH + CARD_OFFSET, right: 0 }}
					onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
				>
					<div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
						{virtualizer.getVirtualItems().map(virtualItem => {
							const { entry } = visibleEntries[virtualItem.index]
							return (
								<div
									key={virtualItem.key}
									data-index={virtualItem.index}
									ref={virtualizer.measureElement}
									style={{
										position: "absolute",
										top:      virtualItem.start,
										left:     0,
										right:    0,
									}}
								>
									<SinglePlotUnit
										unit={entry}
										index={virtualItem.index}
										isSingleFile={isSingleFile}
									/>
								</div>
							)
						})}
					</div>
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
