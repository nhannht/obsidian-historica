import { TFile } from "obsidian";
import { motion } from "motion/react";
import type HistoricaPlugin from "@/main";
import { GlobalEntry } from "./useVaultEntries";
import { DUR } from "@/src/ui/animTokens";

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
		<motion.div
			initial={{opacity: 0, y: 2}}
			animate={{opacity: 1, y: 0}}
			transition={{duration: DUR.reveal}}
			style={{
				display: "flex", gap: 12, padding: "8px 12px",
				borderBottom: "1px solid color-mix(in srgb, var(--background-modifier-border) 30%, transparent)",
			}}
		>
			<span style={{fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)", minWidth: 96, flexShrink: 0, paddingTop: 1}}>
				{formatDate(entry)}
			</span>
			<div style={{flex: 1, minWidth: 0}}>
				<div style={{fontSize: 13, color: "var(--text-normal)", lineHeight: 1.4, marginBottom: 3}}>
					{entry.sentence}
				</div>
				{entry.notePath && (
					<span
						onClick={openNote}
						style={{fontSize: 11, color: "var(--text-accent)", opacity: 0.8, cursor: "pointer"}}
					>
						{entry.noteTitle || entry.notePath}
					</span>
				)}
			</div>
		</motion.div>
	);
}
