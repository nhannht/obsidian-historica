import {useMemo, useState} from "react";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";
import {ExportAsJSONToClipboard, ExportAsMarkdownToClipboard, ExportAsPlainTextToClipboard, exportTimelineAsPng, exportTimelineAsHtml, getAllMarkdownFileInVault} from "@/src/utils";
import {NativeDropdownMenu} from "@/src/ui/NativeDropdownMenu";
import {FilePicker} from "@/src/ui/FilePicker";

const btnClass = "px-2 py-0.5 rounded text-[color:--text-muted] hover:text-[color:--text-normal] hover:bg-[--background-modifier-hover] cursor-pointer";

export function TimelineToolbar(props: {
	timelineRef: React.RefObject<HTMLDivElement | null>;
}) {
	const {plugin} = useTimeline();
	const units = useTimelineStore(s => s.units);
	const settings = useTimelineStore(s => s.settings);
	const showHidden = useTimelineStore(s => s.showHidden);
	const isDirty = useTimelineStore(s => s.isDirty);
	const isSaving = useTimelineStore(s => s.isSaving);
	const autoSave = useTimelineStore(s => s.settings.autoSave ?? true);
	const manualSave = useTimelineStore(s => s.manualSave);
	const sort = useTimelineStore(s => s.sort);
	const expandAll = useTimelineStore(s => s.expandAll);
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

	const saveStatus = isSaving
		? "Saving..."
		: isDirty
			? "Unsaved"
			: settings.blockId === "-1"
				? "Not saved yet"
				: "Saved";

	const saveStatusColor = isSaving
		? "text-[color:--text-muted]"
		: isDirty
			? "text-[color:--text-accent]"
			: "text-[color:--text-muted] opacity-60";

	const handleExportPng = (mode: "save" | "clipboard") => {
		if (props.timelineRef.current) exportTimelineAsPng(props.timelineRef.current, mode);
	};

	return (
		<div className="border-b border-[--background-modifier-border] px-3 py-1.5 text-xs">
			<div className="flex items-center justify-between mb-1">
				<div className="flex items-center gap-2">
					<span
						className="font-semibold text-[color:--text-normal] cursor-pointer hover:text-[color:--text-accent] flex items-center gap-1"
						onClick={() => setIsCollapsed(!isCollapsed)}
						title={isCollapsed ? "Show toolbar" : "Hide toolbar"}
					>
						<svg className="w-3 h-3 transition-transform" style={{transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)"}} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4L6 8L10 4"/></svg>
						Historica
					</span>
					<span className="text-[color:--text-muted]">{visibleCount} entries{hiddenCount > 0 ? ` (${hiddenCount} hidden)` : ""}</span>
					{isStale && (
						<button
							className="text-[color:--text-muted] opacity-60 hover:opacity-100 hover:text-[color:--text-accent] cursor-pointer"
							title="Source file changed since last extraction — re-parse to update"
							onClick={() => {
								const f = plugin.app.workspace.getActiveFile();
								if (f) parseFromFile(f.path);
							}}
						>
							↻
						</button>
					)}
				</div>
				<span className={saveStatusColor}>{saveStatus}</span>
			</div>

			{coverageStats && (
				<div className="flex items-center gap-1.5 pb-0.5 text-[10px] text-[color:var(--text-faint)]">
					<span className="font-mono">{coverageStats.datesFound} dates</span>
					<span>·</span>
					<span className="font-mono">{coverageStats.sentencesScanned} sentences</span>
					{coverageStats.sentencesScanned > 0 && (
						<span className="opacity-50 font-mono">
							{Math.round((coverageStats.datesFound / coverageStats.sentencesScanned) * 100)}%
						</span>
					)}
				</div>
			)}

			{!isCollapsed && (
				<div className="flex items-center gap-1 flex-wrap">
					<button className={btnClass} onClick={() => expandAll(!allExpanded)}>
						{allExpanded ? "Fold all" : "Expand all"}
					</button>

					<NativeDropdownMenu
						trigger="Sort"
						triggerClassName={btnClass}
						items={[
							{type: "item", label: "Ascending", onClick: () => sort("asc")},
							{type: "item", label: "Descending", onClick: () => sort("desc")},
						]}
					/>

					<NativeDropdownMenu
						trigger={isParsing ? "Parsing..." : "Parse"}
						triggerClassName={btnClass}
						disabled={isParsing}
						onTriggerClick={() => {
							const f = plugin.app.workspace.getActiveFile();
							if (f) parseFromFile(f.path);
						}}
						items={[
							...(plugin.app.workspace.getActiveFile() ? [{
								type: "item" as const,
								label: "Parse this file",
								onClick: () => {
									const f = plugin.app.workspace.getActiveFile();
									if (f) parseFromFile(f.path);
								},
							}] : []),
							{type: "item", label: "Parse from file...", submenuContent: (
								<FilePicker
									files={markdownFiles}
									placeholder="search file path"
									emptyText="No file selected"
									onSelect={(value) => parseFromFile(value)}
								/>
							)},
						]}
					/>

					<NativeDropdownMenu
						trigger="Export"
						triggerClassName={btnClass}
						items={[
							{type: "item", label: "PNG (save file)", onClick: () => handleExportPng("save")},
							{type: "item", label: "PNG (clipboard)", onClick: () => handleExportPng("clipboard")},
							{type: "item", label: "Plain text (clipboard)", onClick: () => ExportAsPlainTextToClipboard({units, settings})},
							{type: "item", label: "JSON (clipboard)", onClick: () => ExportAsJSONToClipboard({units, settings})},
							{type: "item", label: "Markdown (clipboard)", onClick: () => ExportAsMarkdownToClipboard({units, settings}, plugin)},
							{type: "item", label: "HTML (save file)", onClick: () => exportTimelineAsHtml({units, settings}, plugin)},
						]}
					/>

					<button
						className={`px-2 py-0.5 rounded cursor-pointer ${isDirty ? "text-[color:--text-accent] hover:bg-[--background-modifier-hover]" : "text-[color:--text-muted] hover:text-[color:--text-normal] hover:bg-[--background-modifier-hover]"}`}
						onClick={() => manualSave()}
					>Save</button>

					<button
						className={`px-2 py-0.5 rounded cursor-pointer border ${autoSave ? "border-[--interactive-accent] text-[color:--text-accent]" : "border-[--background-modifier-border] text-[color:--text-muted] hover:text-[color:--text-normal]"}`}
						onClick={toggleAutoSave}
						title="Toggle auto-save"
					>Auto-save</button>

					{hiddenCount > 0 && (
						<button className={btnClass} onClick={toggleShowHidden}>
							{showHidden ? "Hide hidden" : `Show hidden (${hiddenCount})`}
						</button>
					)}

					<div className="flex items-center gap-1.5 ml-1">
						<span className="text-[color:--text-muted] font-mono text-[9px] whitespace-nowrap">
							{sigFilter === 1 ? "sig: all" : `hiding: sig <${sigFilter}`}
						</span>
						<input
							type="range"
							min={1}
							max={5}
							step={1}
							value={sigFilter}
							onChange={e => setSigFilter(Number(e.target.value))}
							className="w-16 accent-[--interactive-accent] cursor-pointer"
							title={sigFilter === 1 ? "Significance filter: showing all" : `Hiding events below significance ${sigFilter}`}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
