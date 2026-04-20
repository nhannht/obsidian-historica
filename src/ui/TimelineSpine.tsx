import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { zoom as d3zoom, zoomIdentity, ZoomBehavior, D3ZoomEvent } from "d3-zoom"
import { select } from "d3-selection"
import { useD3TimelineEngine, entryYear } from "@/src/store/useD3TimelineEngine"
import { SinglePlotUnit } from "@/src/ui/SinglePlotUnit"
import { useTimeline, useTimelineStore } from "@/src/ui/TimelineContext"
import { TimelineMinimap } from "@/src/ui/TimelineMinimap"
import { useVirtualizer } from "@tanstack/react-virtual"
import { entrySig } from "@/src/utils"
import type { TimelineEntry } from "@/src/types"
import { StatPill } from "@/src/ui/StatPill"
import { SectionLabel } from "@/src/ui/SectionLabel"

function useGlobalAnchorEntries(currentBlockId: string): TimelineEntry[] {
	const { plugin } = useTimeline()
	const units = useTimelineStore(s => s.units)

	return useMemo(
		() => plugin.vaultIndex.getAnchorEntries(currentBlockId),
		// Re-derive when local units change (anchor toggle triggers save → index update)
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[plugin, currentBlockId, units],
	)
}

const AXIS_WIDTH  = 80    // px reserved for the left SVG axis
const CARD_OFFSET = 8     // gap between axis and cards
const VIEWPORT_H  = 600   // visible height in px

export function TimelineSpine({ isSingleFile }: { isSingleFile: boolean }) {
	const units        = useTimelineStore(s => s.units)
	const showHidden   = useTimelineStore(s => s.showHidden)
	const sigFilter    = useTimelineStore(s => s.sigFilter)
	const currentBlockId = useTimelineStore(s => s.settings.blockId)

	const [zoomK, setZoomK]               = useState(1)
	const [scrollTop, setScrollTop]       = useState(0)
	const [zoomBehavior, setZoomBehavior] = useState<ZoomBehavior<HTMLDivElement, unknown> | null>(null)
	// Year-range filter: null = show all, set = filter entries to this year range (filter bar)
	const [yearFilter, setYearFilter]     = useState<[number, number] | null>(null)

	const containerRef       = useRef<HTMLDivElement>(null)
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const zoomKRef           = useRef(1)  // stale-closure escape hatch for zoom handler
	const scrollRafRef       = useRef(0)

	const anchorUnits = useGlobalAnchorEntries(currentBlockId)
	const engine = useD3TimelineEngine(units, anchorUnits, showHidden, zoomK)

	// Reset year filter when domain changes (new parse / different file)
	useEffect(() => { setYearFilter(null) }, [engine.yearMin, engine.yearMax])

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
					const cursorY  = (event.sourceEvent as MouseEvent)?.offsetY ?? VIEWPORT_H / 2  // VIEWPORT_H fallback intentional here (zoom setup, not render height)
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

	// Drag-to-scroll on the whole container (axis + cards)
	useEffect(() => {
		const container = containerRef.current
		const sc = scrollContainerRef.current
		if (!container || !sc) return

		const DRAG_THRESHOLD = 5
		let isPending = false
		let isDragging = false
		let startY = 0
		let startScrollTop = 0

		const onMouseDown = (e: MouseEvent) => {
			const target = e.target as HTMLElement
			if (target.closest('button, a, input, textarea, [role="button"]')) return
			isPending = true
			isDragging = false
			startY = e.clientY
			startScrollTop = sc.scrollTop
		}

		const onMouseMove = (e: MouseEvent) => {
			if (!isPending && !isDragging) return
			const dy = e.clientY - startY
			if (!isDragging && Math.abs(dy) > DRAG_THRESHOLD) {
				isDragging = true
				isPending = false
				container.style.cursor = "grabbing"
			}
			if (isDragging) {
				sc.scrollTop = startScrollTop - dy
			}
		}

		const onMouseUp = (_e: MouseEvent) => {
			if (isDragging) {
				// Suppress the click that fires on mouseup after a drag
				container.addEventListener("click", (ev) => ev.stopPropagation(), { capture: true, once: true })
			}
			isPending = false
			isDragging = false
			container.style.cursor = ""
		}

		container.addEventListener("mousedown", onMouseDown)
		window.addEventListener("mousemove", onMouseMove)
		window.addEventListener("mouseup", onMouseUp)

		return () => {
			container.removeEventListener("mousedown", onMouseDown)
			window.removeEventListener("mousemove", onMouseMove)
			window.removeEventListener("mouseup", onMouseUp)
		}
	}, [])

	const visibleEntries = useMemo(() => {
		const filterMin = yearFilter ? Math.round(yearFilter[0]) : null
		const filterMax = yearFilter ? Math.round(yearFilter[1]) : null
		return engine.positionedEntries.filter(({ entry }) => {
			if (entrySig(entry) < sigFilter) return false
			if (filterMin !== null && filterMax !== null) {
				const yr = entryYear(entry)
				if (yr !== null && (yr < filterMin || yr > filterMax)) return false
			}
			return true
		})
	}, [engine.positionedEntries, sigFilter, yearFilter])

	// Virtualizer — dynamic height measurement via measureElement (ResizeObserver internally)
	const virtualizer = useVirtualizer({
		count:          visibleEntries.length,
		getScrollElement: () => scrollContainerRef.current,
		estimateSize:   (i) => visibleEntries[i]?.entry.isExpanded ? 240 : 32,
		measureElement: (el) => el.getBoundingClientRect().height,
		getItemKey:     (i) => visibleEntries[i]?.entry.id ?? i,
		overscan:       3,
	})

	const rawTotalH     = virtualizer.getTotalSize()
	const containerH    = Math.min(VIEWPORT_H, rawTotalH || VIEWPORT_H)

	// Stable fallback for filterRange prop — avoids creating a new array ref every render
	const fullDomainRange = useMemo<[number, number]>(
		() => [engine.yearMin, engine.yearMax],
		[engine.yearMin, engine.yearMax],
	)

	// Minimap view box: maps scroll position onto the active year range
	// (constrained to filter range when a filter is set, so view box stays inside filter bar)
	const totalVirtualH     = rawTotalH || 1
	const filterDomainLeft  = yearFilter ? yearFilter[0] : engine.yearMin
	const filterDomainRight = yearFilter ? yearFilter[1] : engine.yearMax
	const viewportYearRange = useMemo<[number, number]>(() => {
		const startFrac = Math.max(0, Math.min(1, scrollTop / totalVirtualH))
		const endFrac   = Math.max(0, Math.min(1, (scrollTop + containerH) / totalVirtualH))
		const span = filterDomainRight - filterDomainLeft
		return [filterDomainLeft + startFrac * span, filterDomainLeft + endFrac * span]
	}, [scrollTop, containerH, filterDomainLeft, filterDomainRight, totalVirtualH])

	// Dragging the minimap view box scrolls within the active filter domain
	const handleMinimapScroll = useCallback(([newLeft]: [number, number]) => {
		const sc = scrollContainerRef.current
		if (!sc) return
		const span = filterDomainRight - filterDomainLeft
		if (span <= 0) return
		const startFrac = (newLeft - filterDomainLeft) / span
		sc.scrollTop = Math.max(0, startFrac * sc.scrollHeight)
	}, [filterDomainLeft, filterDomainRight])

	// Year labels: placed at the first card in each year group
	const firstInYear = useMemo(() => {
		const map = new Map<number, number>() // index → year
		let lastYear = -Infinity
		for (let i = 0; i < visibleEntries.length; i++) {
			const year = entryYear(visibleEntries[i].entry)
			if (year !== null && year !== lastYear) {
				map.set(i, year)
				lastYear = year
			}
		}
		return map
	}, [visibleEntries])

	return (
		<div className="flex flex-col">
			{/* ── Minimap strip ────────────────────────────────────────────── */}
			{zoomBehavior && (
				<div className="px-2 pt-1 pb-1 border-b border-[--background-modifier-border]">
					{/* Filter year range pill — centered above minimap, updates live on drag */}
					<div style={{ display: "flex", justifyContent: "center", marginBottom: 3 }}>
						<div style={{
							fontSize: 9,
							fontFamily: "var(--font-monospace)",
							color: "var(--text-muted)",
							border: "1px solid var(--background-modifier-border)",
							borderRadius: 4,
							padding: "1px 8px",
							lineHeight: 1.5,
						}}>
							{Math.round((yearFilter ?? fullDomainRange)[0])} – {Math.round((yearFilter ?? fullDomainRange)[1])}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex-1 min-w-0">
							<TimelineMinimap
								yearMin={engine.yearMin}
								yearMax={engine.yearMax}
								yearRange={viewportYearRange}
								onYearRangeChange={handleMinimapScroll}
								positionedEntries={engine.positionedEntries}
								filterRange={yearFilter ?? fullDomainRange}
								onFilterRangeChange={setYearFilter}
							/>
						</div>
						<StatPill value={`sig ≥ ${engine.visibleMinSig} · ${visibleEntries.length} events`}/>
					</div>
				</div>
			)}

			<div
				ref={containerRef}
				className="relative overflow-hidden select-none cursor-grab"
				style={{ height: containerH }}
			>
				{/* ── SVG axis spine — dots aligned to card positions ─────── */}
				<svg
					className="absolute inset-0 pointer-events-none"
					width={AXIS_WIDTH}
					height={containerH}
				>
					<line
						x1={AXIS_WIDTH - 1} y1={0}
						x2={AXIS_WIDTH - 1} y2={containerH}
						stroke="var(--background-modifier-border)"
						strokeWidth={2}
					/>

					{virtualizer.getVirtualItems().map(vi => {
						const { entry } = visibleEntries[vi.index]
						const sy = vi.start + 14 - scrollTop
						if (sy < -20 || sy > containerH + 20) return null

						const sig     = entrySig(entry)
						const r       = 3 + sig * 1.5
						const opacity = 0.55 + sig * 0.09
						const fill    = entry.isAnchor ? "var(--text-warning)" : "var(--interactive-accent)"
						const year    = entryYear(entry)
						const dateLine = year !== null && entry.parsedResultText !== String(year)
							? `${entry.parsedResultText} → ${year}`
							: entry.parsedResultText
						const tip     = `${dateLine}${entry.sentence ? "\n" + entry.sentence.slice(0, 100) : ""}\nSignificance: ${sig}/5${entry.isAnchor ? " (anchor)" : ""}`

						const yearLabel = firstInYear.get(vi.index)

						return (
							<g key={`dot-${entry.id}`} style={{pointerEvents: "auto", cursor: "default"}}>
								<title>{tip}</title>
								{yearLabel !== undefined && (
									<>
										<line x1={AXIS_WIDTH - 12} y1={sy} x2={AXIS_WIDTH - 1} y2={sy}
											stroke="var(--background-modifier-border)" strokeWidth={1.5} />
										<text x={AXIS_WIDTH - 15} y={sy + 4} textAnchor="end"
											fontSize={11} fill="var(--text-muted)" fontFamily="var(--font-monospace)">
											{yearLabel}
										</text>
									</>
								)}
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

				{/* ── Virtualized card list ──────────────────────────────────── */}
				<div
					ref={scrollContainerRef}
					className="absolute top-0 bottom-0 overflow-y-auto historica-no-scrollbar"
					style={{ left: AXIS_WIDTH + CARD_OFFSET, right: 0 }}
					onScroll={e => {
						const top = e.currentTarget.scrollTop
						cancelAnimationFrame(scrollRafRef.current)
						scrollRafRef.current = requestAnimationFrame(() => setScrollTop(top))
					}}
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
						<SectionLabel className="mb-1">Undated</SectionLabel>
						{engine.freeEntries.map((entry) => (
							<SinglePlotUnit key={entry.id} unit={entry} index={0} isSingleFile={isSingleFile}/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

