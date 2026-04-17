import { useMemo } from "react";
import type HistoricaPlugin from "@/main";
import { useVaultEntries } from "@/src/ui/global/useVaultEntries";

interface SidebarHomeProps {
	plugin: HistoricaPlugin;
	message: string;
}

export function SidebarHome({ plugin, message }: SidebarHomeProps) {
	const { entries, loading } = useVaultEntries(plugin);

	const stats = useMemo(() => {
		if (loading) return null;
		const index = plugin.vaultIndex.getIndex();
		const totalEvents = Object.values(index).reduce((sum, e) => sum + e.entryCount, 0);
		const totalNotes = new Set(
			Object.values(index).map(e => e.notePath).filter(Boolean)
		).size;

		const unix = entries.map(e => e.unixTime).filter((t): t is number => t !== null);
		const earliestMs = unix.length ? unix.reduce((a, b) => Math.min(a, b)) : null;
		const earliest = earliestMs !== null ? new Date(earliestMs) : null;

		return { totalEvents, totalNotes, earliest };
	}, [entries, loading, plugin]);

	return (
		<div className="flex flex-col h-full overflow-hidden text-[var(--text-normal)]">
			{/* Placeholder message */}
			<div className="px-4 py-3 text-sm text-[var(--text-muted)] border-b border-[var(--background-modifier-border)]">
				{message}
			</div>

			{/* Vault stats */}
			{stats && (
				<div className="px-4 py-3 flex flex-col gap-2">
					<span className="text-xs font-semibold text-[var(--text-accent)] uppercase tracking-wide">
						Vault Index
					</span>
					<div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
						<span className="text-[var(--text-muted)]">Events indexed</span>
						<span className="font-medium">{stats.totalEvents.toLocaleString()}</span>
						<span className="text-[var(--text-muted)]">Notes parsed</span>
						<span className="font-medium">{stats.totalNotes.toLocaleString()}</span>
						{stats.earliest && (
							<>
								<span className="text-[var(--text-muted)]">Earliest event</span>
								<span className="font-medium">
									{stats.earliest.getFullYear() < 0
										? `${Math.abs(stats.earliest.getFullYear())} BC`
										: stats.earliest.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
								</span>
							</>
						)}
					</div>
				</div>
			)}

			{loading && (
				<div className="flex-1 flex items-center justify-center text-xs text-[var(--text-muted)]">
					Loading vault index…
				</div>
			)}
		</div>
	);
}
