import { useMemo } from "react";
import type { GlobalEntry } from "@/src/ui/global/useVaultEntries";
import { detectGaps } from "@/src/compute/detectGaps";

interface GapPromptsProps {
	entries: GlobalEntry[];
	loading: boolean;
}

export function GapPrompts({ entries, loading }: GapPromptsProps) {
	const gaps = useMemo(() => detectGaps(entries, 3), [entries]);

	if (loading || gaps.length === 0) return null;

	return (
		<div className="historica-gap-prompts px-4 py-3 border-b border-[var(--background-modifier-border)]">
			<span className="text-xs font-semibold text-[var(--text-accent)] uppercase tracking-wide">
				Gaps in your timeline
			</span>
			<div className="flex flex-col gap-2 mt-2">
				{gaps.map((gap) => (
					<div
						key={gap.startMs}
						className="text-xs text-[var(--text-muted)] bg-[var(--background-secondary)] rounded px-3 py-2 leading-relaxed"
					>
						<span className="text-[var(--text-normal)] font-medium">
							Nothing recorded
						</span>{" "}
						{gap.label}. What was happening then?
					</div>
				))}
			</div>
		</div>
	);
}
