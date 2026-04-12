import { TFile } from "obsidian";
import type HistoricaPlugin from "@/main";
import { GlobalEntry } from "./useVaultEntries";

function formatDate(entry: GlobalEntry): string {
	// parsedResultText is already human-readable (e.g. "509 BC", "Jan 15, 2023")
	if (entry.parsedResultText) return entry.parsedResultText;
	return entry.time.value;
}

interface EntryCardProps {
	entry: GlobalEntry;
	plugin: HistoricaPlugin;
}

export function EntryCard({ entry, plugin }: EntryCardProps) {
	function openNote() {
		if (!entry.notePath) return;
		const file = plugin.app.vault.getAbstractFileByPath(entry.notePath);
		if (file instanceof TFile) {
			plugin.app.workspace.getLeaf().openFile(file);
		}
	}

	return (
		<div className="historica-entry-card flex gap-3 px-4 py-3 border-b border-[var(--background-modifier-border)] hover:bg-[var(--background-secondary)] transition-colors">
			{/* Date marker */}
			<div className="flex-shrink-0 w-28 pt-0.5">
				<span className="text-xs font-mono text-[var(--text-muted)]">
					{formatDate(entry)}
				</span>
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<p className="text-sm text-[var(--text-normal)] line-clamp-2 leading-snug">
					{entry.sentence}
				</p>
				{entry.notePath && (
					<button
						onClick={openNote}
						className="mt-1 text-xs text-[var(--text-accent)] hover:underline truncate max-w-full text-left"
					>
						{entry.noteTitle || entry.notePath}
					</button>
				)}
			</div>
		</div>
	);
}
