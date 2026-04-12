import { StoreApi } from "zustand"
import { TimelineStore } from "@/src/store/createTimelineStore"
import { TimelineBlock } from "@/src/ui/TimelineBlock"
import HistoricaPlugin from "@/main"

export type BlockInfo = {
	blockId: string
	label: string
}

export function SidebarShell({
	blocks,
	selectedId,
	onSelect,
	store,
	plugin,
}: {
	blocks: BlockInfo[]
	selectedId: string
	onSelect: (blockId: string) => void
	store: StoreApi<TimelineStore>
	plugin: HistoricaPlugin
}) {
	return (
		<div className="flex flex-col h-full">
			{blocks.length > 1 && (
				<div className="flex flex-wrap gap-1 px-2 pt-2 pb-1 border-b border-[--background-modifier-border]">
					{blocks.map(b => (
						<button
							key={b.blockId}
							onClick={() => onSelect(b.blockId)}
							className={`text-xs px-2 py-0.5 rounded transition-colors ${
								b.blockId === selectedId
									? "bg-[--interactive-accent] text-[--text-on-accent]"
									: "bg-[--background-modifier-hover] text-[color:--text-muted] hover:text-[color:--text-normal]"
							}`}
						>
							{b.label}
						</button>
					))}
				</div>
			)}
			<div className="flex-1 overflow-auto">
				<TimelineBlock store={store} plugin={plugin}/>
			</div>
		</div>
	)
}
