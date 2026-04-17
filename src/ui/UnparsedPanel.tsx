import {useState} from "react";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";

const PAGE_SIZE = 20;

export function UnparsedPanel() {
	const {plugin} = useTimeline();
	const unparsedSentences = useTimelineStore(s => s.unparsedSentences);
	const tagSentence = useTimelineStore(s => s.tagSentence);

	const [open, setOpen] = useState(false);
	const [page, setPage] = useState(0);
	const [taggingIdx, setTaggingIdx] = useState<number | null>(null);
	const [dateInput, setDateInput] = useState("");

	if (unparsedSentences.length === 0) return null;

	const totalPages = Math.ceil(unparsedSentences.length / PAGE_SIZE);
	const pageItems = unparsedSentences.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

	function handleTag(sentence: string) {
		if (!dateInput.trim()) return;
		const filePath = plugin.app.workspace.getActiveFile()?.path ?? "";
		tagSentence(sentence, dateInput.trim(), filePath);
		setTaggingIdx(null);
		setDateInput("");
		if (pageItems.length === 1 && page > 0) setPage(p => p - 1);
	}

	return (
		<div className="border-t border-[--background-modifier-border] mt-2 text-xs">
			{/* Header */}
			<button
				className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left text-[color:var(--text-muted)] hover:text-[color:var(--text-normal)] hover:bg-[--background-modifier-hover] cursor-pointer"
				onClick={() => setOpen(o => !o)}
			>
				<svg className="w-3 h-3 transition-transform shrink-0" style={{transform: open ? "rotate(90deg)" : "rotate(0deg)"}} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2L8 6L4 10"/></svg>
				<span className="font-medium">{unparsedSentences.length} unmatched sentence{unparsedSentences.length !== 1 ? "s" : ""}</span>
				<span className="opacity-50 font-normal">— no date found</span>
			</button>

			{open && (
				<div className="px-3 pb-3">
					<div className="flex flex-col gap-1 mt-1">
						{pageItems.map((sentence, i) => {
							const globalIdx = page * PAGE_SIZE + i;
							const isTagging = taggingIdx === globalIdx;
							return (
								<div key={globalIdx} className="flex flex-col gap-1 py-1 border-b border-[--background-modifier-border]/50 last:border-0">
									<span className="text-[color:var(--text-muted)] leading-snug">{sentence}</span>
									{!isTagging && (
										<button
											className="self-start text-[10px] text-[color:var(--text-faint)] hover:text-[color:var(--text-accent)] cursor-pointer opacity-60 hover:opacity-100"
											onClick={() => { setTaggingIdx(globalIdx); setDateInput(""); }}
										>Tag with date…</button>
									)}
									{isTagging && (
										<div className="flex items-center gap-1.5 mt-0.5">
											<input
												autoFocus
												type="text"
												className="flex-1 text-xs px-2 py-0.5 rounded border border-[--background-modifier-border] bg-[--background-primary] text-[color:var(--text-normal)] outline-none focus:border-[--interactive-accent]"
												placeholder="e.g. March 1492"
												value={dateInput}
												onChange={e => setDateInput(e.target.value)}
												onKeyDown={e => {
													if (e.key === "Enter") handleTag(sentence);
													if (e.key === "Escape") { setTaggingIdx(null); setDateInput(""); }
												}}
											/>
											<button
												className="text-[10px] px-2 py-0.5 rounded bg-[--interactive-accent] text-[color:var(--text-on-accent)] cursor-pointer hover:opacity-90 disabled:opacity-40"
												disabled={!dateInput.trim()}
												onClick={() => handleTag(sentence)}
											>Add</button>
											<button
												className="text-[10px] text-[color:var(--text-faint)] hover:text-[color:var(--text-muted)] cursor-pointer"
												onClick={() => { setTaggingIdx(null); setDateInput(""); }}
											>Cancel</button>
										</div>
									)}
								</div>
							);
						})}
					</div>

					{totalPages > 1 && (
						<div className="flex items-center gap-2 mt-2 text-[color:var(--text-faint)]">
							<button
								className="hover:text-[color:var(--text-muted)] disabled:opacity-30 cursor-pointer"
								disabled={page === 0}
								onClick={() => setPage(p => p - 1)}
							>← Prev</button>
							<span>{page + 1} / {totalPages}</span>
							<button
								className="hover:text-[color:var(--text-muted)] disabled:opacity-30 cursor-pointer"
								disabled={page >= totalPages - 1}
								onClick={() => setPage(p => p + 1)}
							>Next →</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
