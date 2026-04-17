import {CSSProperties, useMemo, useState} from "react";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";
import {ExportAsJSONToClipboard, ExportAsMarkdownToClipboard, ExportAsPlainTextToClipboard, exportTimelineAsPng, exportTimelineAsHtml, getAllMarkdownFileInVault} from "@/src/utils";
import {NativeDropdownMenu} from "@/src/ui/NativeDropdownMenu";
import {FilePicker} from "@/src/ui/FilePicker";
import {Spinner} from "@/src/ui/Spinner";
import {SIG_LEVELS} from "@/src/ui/gallery/constants";

const btn: CSSProperties = {
	fontSize: 11, padding: "2px 6px", borderRadius: 3,
	color: "var(--text-muted)", cursor: "pointer",
	border: "none", background: "transparent",
};

const iconBtn: CSSProperties = {
	display: "flex", alignItems: "center", justifyContent: "center",
	width: 22, height: 22, borderRadius: 3,
	color: "var(--text-muted)", cursor: "pointer",
	border: "none", background: "transparent",
};

const DIVIDER = <div style={{width: 1, height: 14, background: "var(--background-modifier-border)", margin: "0 2px", flexShrink: 0}}/>;

export function TimelineToolbar(props: {
	timelineRef: React.RefObject<HTMLDivElement | null>;
}) {
	const {plugin} = useTimeline();
	const units = useTimelineStore(s => s.units);
	const settings = useTimelineStore(s => s.settings);
	const isDirty = useTimelineStore(s => s.isDirty);
	const isSaving = useTimelineStore(s => s.isSaving);
	const autoSave = useTimelineStore(s => s.settings.autoSave ?? true);
	const manualSave = useTimelineStore(s => s.manualSave);
	const sort = useTimelineStore(s => s.sort);
	const expandAll = useTimelineStore(s => s.expandAll);
	const showHidden = useTimelineStore(s => s.showHidden);
	const toggleShowHidden = useTimelineStore(s => s.toggleShowHidden);
	const sigFilter = useTimelineStore(s => s.sigFilter);
	const setSigFilter = useTimelineStore(s => s.setSigFilter);
	const toggleAutoSave = useTimelineStore(s => s.toggleAutoSave);
	const parseFromFile = useTimelineStore(s => s.parseFromFile);
	const isParsing = useTimelineStore(s => s.isParsing);
	const isStale = useTimelineStore(s => s.isStale);
	const coverageStats = useTimelineStore(s => s.coverageStats);

	const [isCollapsed, setIsCollapsed] = useState(false);
	const markdownFiles = useMemo(() => getAllMarkdownFileInVault(plugin), [plugin]);

	const hiddenCount = units.filter(u => u.isHidden).length;
	const visibleCount = units.length - hiddenCount;
	const allExpanded = units.length > 0 && units.every(u => u.isExpanded);

	const saveStatus = isSaving ? "Saving…" : isDirty ? "Unsaved" : settings.blockId === "-1" ? "Not saved yet" : "Saved";
	const saveStatusColor = isDirty ? "var(--text-accent)" : "var(--text-muted)";
	const saveStatusOpacity = isDirty ? 1 : 0.6;

	const handleExportPng = (mode: "save" | "clipboard") => {
		if (props.timelineRef.current) exportTimelineAsPng(props.timelineRef.current, mode);
	};

	return (
		<div style={{borderBottom: "1px solid var(--background-modifier-border)"}}>

			{/* Header row */}
			<div style={{
				display: "flex", alignItems: "center", justifyContent: "space-between",
				padding: "5px 10px",
				borderBottom: isCollapsed ? undefined : "1px solid var(--background-modifier-border)",
			}}>
				<div style={{display: "flex", alignItems: "center", gap: 6}}>
					<span
						style={{fontSize: 12, fontWeight: 600, color: "var(--text-normal)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4}}
						onClick={() => setIsCollapsed(c => !c)}
					>
						Historica
						<svg style={{width: 10, height: 10, color: "var(--text-faint)", opacity: 0.5, transition: "transform var(--historica-dur-snap, 110ms)", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)"}} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4L6 8L10 4"/></svg>
					</span>
					{isStale && (
						<button
							style={{fontSize: 12, color: "var(--text-muted)", opacity: 0.6, cursor: "pointer", background: "none", border: "none", padding: 0}}
							title="Source file changed — re-parse to update"
							onClick={() => { const f = plugin.app.workspace.getActiveFile(); if (f) parseFromFile(f.path); }}
						>↻</button>
					)}
				</div>
				<div style={{display: "flex", alignItems: "center", gap: 4}}>
					{isSaving && <Spinner size={10}/>}
					<span style={{fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)", opacity: 0.5}}>
						{visibleCount} entries{hiddenCount > 0 ? ` (${hiddenCount} hidden)` : ""}
					</span>
					<span style={{fontSize: 10, color: "var(--text-faint)", opacity: 0.4, margin: "0 2px"}}>·</span>
					<span style={{fontSize: 10, color: saveStatusColor, opacity: saveStatusOpacity}}>{saveStatus}</span>
				</div>
			</div>

			{!isCollapsed && <>

				{/* Stats row */}
				{coverageStats && (
					<div style={{
						display: "flex", alignItems: "center", gap: 6,
						padding: "3px 10px",
						borderBottom: "1px solid color-mix(in srgb, var(--background-modifier-border) 50%, transparent)",
					}}>
						<span style={{fontFamily: "monospace", fontSize: 10, color: "var(--text-faint)"}}>{coverageStats.datesFound} dates</span>
						<span style={{color: "var(--text-faint)", opacity: 0.4, fontSize: 10}}>·</span>
						<span style={{fontFamily: "monospace", fontSize: 10, color: "var(--text-faint)"}}>{coverageStats.sentencesScanned} sentences</span>
						{coverageStats.sentencesScanned > 0 && <>
							<span style={{color: "var(--text-faint)", opacity: 0.4, fontSize: 10}}>·</span>
							<span style={{fontFamily: "monospace", fontSize: 10, color: "var(--text-faint)", opacity: 0.5}}>
								{Math.round((coverageStats.datesFound / coverageStats.sentencesScanned) * 100)}%
							</span>
						</>}
					</div>
				)}

				{/* Controls row */}
				<div style={{display: "flex", alignItems: "center", gap: 2, padding: "4px 8px", flexWrap: "wrap"}}>

					{/* Parse */}
					<NativeDropdownMenu
						trigger={
							<span style={{display: "inline-flex", alignItems: "center", gap: 4}}>
								{isParsing
									? <Spinner size={9}/>
									: <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1,6 4,9 11,2"/></svg>
								}
								{isParsing ? "Parsing…" : "Parse"}
							</span>
						}
						triggerStyle={btn}
						disabled={isParsing}
						onTriggerClick={() => { const f = plugin.app.workspace.getActiveFile(); if (f) parseFromFile(f.path); }}
						items={[
							...(plugin.app.workspace.getActiveFile() ? [{
								type: "item" as const,
								label: "Parse this file",
								onClick: () => { const f = plugin.app.workspace.getActiveFile(); if (f) parseFromFile(f.path); },
							}] : []),
							{type: "item", label: "Parse from file…", submenuContent: (
								<FilePicker
									files={markdownFiles}
									placeholder="search file path"
									emptyText="No file selected"
									onSelect={value => parseFromFile(value)}
								/>
							)},
						]}
					/>

					{DIVIDER}

					{/* Sort */}
					<NativeDropdownMenu
						trigger="↑↓ Sort"
						triggerStyle={btn}
						items={[
							{type: "item", label: "Ascending",  onClick: () => sort("asc")},
							{type: "item", label: "Descending", onClick: () => sort("desc")},
						]}
					/>

					{/* Expand / Fold all */}
					<button style={btn} onClick={() => expandAll(!allExpanded)}>
						⊞ {allExpanded ? "Fold all" : "Expand all"}
					</button>

					{/* Show hidden */}
					{hiddenCount > 0 && (
						<button style={btn} onClick={toggleShowHidden}>
							◌ {showHidden ? "Hide hidden" : `Show hidden (${hiddenCount})`}
						</button>
					)}

					{DIVIDER}

					{/* Significance dots */}
					<div style={{display: "flex", alignItems: "center", gap: 3}}>
						{SIG_LEVELS.map(n => {
							const shown = sigFilter === 1 || n >= sigFilter;
							return (
								<div
									key={n}
									onClick={() => setSigFilter(sigFilter === n ? 1 : n)}
									title={n === 1 ? "Show all" : `Show sig ≥ ${n}`}
									style={{
										width: 7, height: 7, borderRadius: "50%",
										background: shown ? "var(--interactive-accent)" : "transparent",
										border: `1.5px solid ${shown ? "var(--interactive-accent)" : "color-mix(in srgb, var(--text-faint) 40%, transparent)"}`,
										opacity: shown ? (sigFilter === 1 ? 0.4 : 1) : 0.25,
										cursor: "pointer",
									}}
								/>
							);
						})}
					</div>

					{/* Right side: auto-save · export · save */}
					<div style={{marginLeft: "auto", display: "flex", alignItems: "center", gap: 2}}>
						<button
							style={{...iconBtn, fontSize: 9, fontFamily: "monospace", width: "auto", padding: "2px 5px", color: autoSave ? "var(--text-accent)" : "var(--text-faint)", opacity: autoSave ? 0.8 : 0.4}}
							onClick={toggleAutoSave}
							title={autoSave ? "Auto-save on" : "Auto-save off"}
						>AS</button>

						<NativeDropdownMenu
							trigger={<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 9h8M6 2v5M3 5l3 3 3-3"/></svg>}
							triggerStyle={iconBtn}
							items={[
								{type: "item", label: "PNG (save file)",         onClick: () => handleExportPng("save")},
								{type: "item", label: "PNG (clipboard)",         onClick: () => handleExportPng("clipboard")},
								{type: "item", label: "Plain text (clipboard)",  onClick: () => ExportAsPlainTextToClipboard({units, settings})},
								{type: "item", label: "JSON (clipboard)",        onClick: () => ExportAsJSONToClipboard({units, settings})},
								{type: "item", label: "Markdown (clipboard)",    onClick: () => ExportAsMarkdownToClipboard({units, settings}, plugin)},
								{type: "item", label: "HTML (save file)",        onClick: () => exportTimelineAsHtml({units, settings}, plugin)},
							]}
						/>

						<button
							style={{...iconBtn, color: isDirty ? "var(--text-accent)" : "var(--text-muted)", opacity: isDirty ? 1 : 0.5}}
							onClick={() => manualSave()}
							title="Save"
						>
							<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 2h7l1 1v7H2z"/><path d="M4 2v3h4V2"/><rect x="3" y="7" width="6" height="3" rx="0.5"/></svg>
						</button>
					</div>

				</div>
			</>}
		</div>
	);
}
