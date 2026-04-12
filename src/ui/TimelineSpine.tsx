import React, { useMemo } from "react"
import { TimelineEngine } from "@/src/store/useTimelineEngine"
import { SinglePlotUnit } from "@/src/ui/SinglePlotUnit"
import { useTimelineStore } from "@/src/ui/TimelineContext"
import {
	DndContext,
	closestCenter,
	type DragEndEvent,
} from "@dnd-kit/core"
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { TimelineEntry } from "@/src/types"

function DecadeMarker({ decade }: { decade: number }) {
	return (
		<div className="relative pl-10 pt-4 pb-1">
			<div className="absolute left-3 top-0 bottom-0 w-px bg-[--background-modifier-border-hover]"/>
			<div className="flex items-center gap-2">
				<span className="text-[10px] font-semibold tracking-widest uppercase text-[color:--text-faint]">
					{decade === -1 ? "Undated" : `${decade}s`}
				</span>
				<div className="flex-1 h-px bg-[--background-modifier-border] opacity-40"/>
			</div>
		</div>
	)
}

function GapSpacer({ years, pixelHeight }: { years: number; pixelHeight: number }) {
	return (
		<div className="relative pl-10" style={{ height: pixelHeight }}>
			<div className="absolute left-3 top-0 bottom-0 w-px bg-[--background-modifier-border-hover] opacity-30"/>
			<div className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] italic text-[color:--text-faint]">
				{years} year{years !== 1 ? "s" : ""}
			</div>
		</div>
	)
}

function SortableEntryRow({
	entry,
	index,
	isSingleFile,
}: {
	entry: TimelineEntry
	index: number
	isSingleFile: boolean
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: entry.id })

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.4 : 1,
		position: "relative",
	}

	return (
		<div ref={setNodeRef} style={style}>
			<SinglePlotUnit
				unit={entry}
				index={index}
				isSingleFile={isSingleFile}
				dragHandleProps={{ ...attributes, ...listeners }}
			/>
		</div>
	)
}

export function TimelineSpine({
	engine,
	isSingleFile,
}: {
	engine: TimelineEngine
	isSingleFile: boolean
}) {
	const reorderUnit = useTimelineStore(s => s.reorderUnit)

	const entryIndexMap = useMemo(() => {
		const map = new Map<string, number>()
		let idx = 0
		for (const row of engine.rows) {
			if (row.type === "entry") map.set(row.entry.id, idx++)
		}
		return map
	}, [engine.rows])

	const sortedEntryIds = useMemo(
		() => Array.from(entryIndexMap.keys()),
		[entryIndexMap],
	)

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event
		if (!over || active.id === over.id) return
		const fromIndex = entryIndexMap.get(active.id as string)
		const toIndex = entryIndexMap.get(over.id as string)
		if (fromIndex !== undefined && toIndex !== undefined) {
			reorderUnit(fromIndex, toIndex)
		}
	}

	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={sortedEntryIds} strategy={verticalListSortingStrategy}>
				<div>
					{engine.rows.map((row, i) => {
						if (row.type === "decade")
							return <DecadeMarker key={`d-${row.decade}-${i}`} decade={row.decade}/>
						if (row.type === "gap")
							return <GapSpacer key={`g-${i}`} years={row.years} pixelHeight={row.pixelHeight}/>
						return (
							<SortableEntryRow
								key={row.entry.id}
								entry={row.entry}
								index={entryIndexMap.get(row.entry.id) ?? 0}
								isSingleFile={isSingleFile}
							/>
						)
					})}
				</div>
			</SortableContext>
		</DndContext>
	)
}
