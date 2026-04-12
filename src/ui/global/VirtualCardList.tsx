import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type HistoricaPlugin from "@/main";
import { GlobalEntry } from "./useVaultEntries";
import { EntryCard } from "./EntryCard";

interface VirtualCardListProps {
	entries: GlobalEntry[];
	plugin: HistoricaPlugin;
}

export function VirtualCardList({ entries, plugin }: VirtualCardListProps) {
	const parentRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: entries.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 76,
		overscan: 15,
	});

	if (entries.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center text-sm text-[var(--text-muted)]">
				No dated entries found across the vault.
			</div>
		);
	}

	return (
		<div ref={parentRef} className="flex-1 overflow-auto">
			<div
				style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}
			>
				{virtualizer.getVirtualItems().map((vItem) => (
					<div
						key={vItem.key}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							transform: `translateY(${vItem.start}px)`,
						}}
						ref={virtualizer.measureElement}
						data-index={vItem.index}
					>
						<EntryCard entry={entries[vItem.index]} plugin={plugin} />
					</div>
				))}
			</div>
		</div>
	);
}
