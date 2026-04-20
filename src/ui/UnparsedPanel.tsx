import {useState} from "react";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";
import {ChevronRight} from "@/src/ui/icons";
import {SectionLabel} from "@/src/ui/SectionLabel";

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
		<div style={{borderTop: "1px solid var(--background-modifier-border)", marginTop: 8}}>
			<button
				style={{
					width: "100%", display: "flex", alignItems: "baseline", gap: 8,
					padding: "8px 12px 10px", textAlign: "left", background: "none", border: "none", cursor: "pointer",
					borderBottom: open ? "2px solid var(--background-modifier-border)" : "2px solid transparent",
				}}
				onClick={() => setOpen(o => !o)}
			>
				<SectionLabel>UNDATED</SectionLabel>
				<span style={{fontFamily: "monospace", fontSize: 16, color: "var(--text-accent)", lineHeight: 1}}>{unparsedSentences.length}</span>
				<span style={{fontSize: 11, color: "var(--text-faint)"}}>fragment{unparsedSentences.length !== 1 ? "s" : ""} without timestamp</span>
				<ChevronRight style={{width: 9, height: 9, marginLeft: "auto", color: "var(--text-faint)", opacity: 0.4, flexShrink: 0, transition: "transform var(--historica-dur-snap, 110ms)", transform: open ? "rotate(90deg)" : "rotate(0deg)"}}/>
			</button>

			{open && (
				<div style={{padding: "0 12px 12px"}}>
					{pageItems.map((sentence, i) => {
						const globalIdx = page * PAGE_SIZE + i;
						const isTagging = taggingIdx === globalIdx;
						return (
							<div key={globalIdx} style={{
								display: "flex", gap: 12, padding: "10px 0",
								borderBottom: i < pageItems.length - 1
									? "1px solid color-mix(in srgb, var(--background-modifier-border) 35%, transparent)"
									: "none",
							}}>
								<span style={{
									fontFamily: "monospace", fontSize: 9, color: "var(--text-faint)",
									opacity: 0.35, minWidth: 18, paddingTop: 2, userSelect: "none",
								}}>{String(globalIdx + 1).padStart(2, "0")}</span>
								<div style={{flex: 1}}>
									<div style={{fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 5}}>{sentence}</div>
									{!isTagging && (
										<span
											style={{fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)", letterSpacing: "0.04em", opacity: 0.5, cursor: "pointer"}}
											onClick={() => { setTaggingIdx(globalIdx); setDateInput(""); }}
										>TAG →</span>
									)}
									{isTagging && (
										<div style={{display: "flex", alignItems: "center", gap: 6}}>
											<input
												autoFocus
												type="text"
												style={{flex: 1, fontSize: 11, padding: "2px 6px", borderRadius: 2, border: "1px solid var(--background-modifier-border)", background: "var(--background-primary)", color: "var(--text-normal)", outline: "none"}}
												placeholder="e.g. March 1492"
												value={dateInput}
												onChange={e => setDateInput(e.target.value)}
												onKeyDown={e => {
													if (e.key === "Enter") handleTag(sentence);
													if (e.key === "Escape") { setTaggingIdx(null); setDateInput(""); }
												}}
											/>
											<button
												style={{fontSize: 10, padding: "2px 8px", borderRadius: 2, background: "var(--interactive-accent)", color: "var(--text-on-accent)", border: "none", cursor: dateInput.trim() ? "pointer" : "default", opacity: dateInput.trim() ? 1 : 0.4}}
												disabled={!dateInput.trim()}
												onClick={() => handleTag(sentence)}
											>Add</button>
											<span
												style={{fontSize: 10, color: "var(--text-faint)", cursor: "pointer", opacity: 0.6}}
												onClick={() => { setTaggingIdx(null); setDateInput(""); }}
											>Cancel</span>
										</div>
									)}
								</div>
							</div>
						);
					})}

					{totalPages > 1 && (
						<div style={{display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)"}}>
							<span
								style={{cursor: page === 0 ? "default" : "pointer", opacity: page === 0 ? 0.3 : 0.7}}
								onClick={() => page > 0 && setPage(p => p - 1)}
							>← Prev</span>
							<span style={{opacity: 0.5}}>{page + 1} / {totalPages}</span>
							<span
								style={{cursor: page >= totalPages - 1 ? "default" : "pointer", opacity: page >= totalPages - 1 ? 0.3 : 0.7}}
								onClick={() => page < totalPages - 1 && setPage(p => p + 1)}
							>Next →</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
