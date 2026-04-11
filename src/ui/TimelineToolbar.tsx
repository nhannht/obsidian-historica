import {useMemo, useState} from "react";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";
import {ExportAsJSONToClipboard, ExportAsMarkdownToClipboard, ExportAsPlainTextToClipboard, exportTimelineAsPng, getAllMarkdownFileInVault} from "@/src/utils";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger
} from "@/src/ui/shadcn/ContextMenu";
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
	const toggleAutoSave = useTimelineStore(s => s.toggleAutoSave);
	const parseFromFile = useTimelineStore(s => s.parseFromFile);

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
						className="font-semibold text-[color:--text-normal] cursor-pointer hover:text-[color:--text-accent]"
						onClick={() => setIsCollapsed(!isCollapsed)}
						title={isCollapsed ? "Show toolbar" : "Hide toolbar"}
					>Historica</span>
					<span className="text-[color:--text-muted]">{visibleCount} entries{hiddenCount > 0 ? ` (${hiddenCount} hidden)` : ""}</span>
				</div>
				<span className={saveStatusColor}>{saveStatus}</span>
			</div>

			{!isCollapsed && (
				<div className="flex items-center gap-1 flex-wrap">
					<button className={btnClass} onClick={() => expandAll(!allExpanded)}>
						{allExpanded ? "Fold all" : "Expand all"}
					</button>

					<ContextMenu>
						<ContextMenuTrigger><button className={btnClass}>Sort</button></ContextMenuTrigger>
						<ContextMenuContent>
							<ContextMenuItem onClick={() => sort("asc")}>Ascending</ContextMenuItem>
							<ContextMenuItem onClick={() => sort("desc")}>Descending</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>

					<ContextMenu>
						<ContextMenuTrigger><button className={btnClass}>Parse</button></ContextMenuTrigger>
						<ContextMenuContent>
							{plugin.app.workspace.getActiveFile() && (
								<ContextMenuItem onClick={() => {
									const f = plugin.app.workspace.getActiveFile();
									if (f) parseFromFile(f.path);
								}}>Parse this file</ContextMenuItem>
							)}
							<ContextMenuSub>
								<ContextMenuSubTrigger>Parse from file...</ContextMenuSubTrigger>
								<ContextMenuSubContent>
									<FilePicker
										files={markdownFiles}
										placeholder="search file path"
										emptyText="No file selected"
										onSelect={(value) => parseFromFile(value)}
									/>
								</ContextMenuSubContent>
							</ContextMenuSub>
						</ContextMenuContent>
					</ContextMenu>

					<ContextMenu>
						<ContextMenuTrigger><button className={btnClass}>Export</button></ContextMenuTrigger>
						<ContextMenuContent>
							<ContextMenuItem onClick={() => handleExportPng("save")}>PNG (save file)</ContextMenuItem>
							<ContextMenuItem onClick={() => handleExportPng("clipboard")}>PNG (clipboard)</ContextMenuItem>
							<ContextMenuItem onClick={() => ExportAsPlainTextToClipboard({units, settings})}>Plain text (clipboard)</ContextMenuItem>
							<ContextMenuItem onClick={() => ExportAsJSONToClipboard({units, settings})}>JSON (clipboard)</ContextMenuItem>
							<ContextMenuItem onClick={() => ExportAsMarkdownToClipboard({units, settings}, plugin)}>Markdown (clipboard)</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>

					<button
						className={`px-2 py-0.5 rounded cursor-pointer ${isDirty ? "text-[color:--text-accent] hover:bg-[--background-modifier-hover]" : "text-[color:--text-muted] hover:text-[color:--text-normal] hover:bg-[--background-modifier-hover]"}`}
						onClick={() => manualSave()}
					>Save</button>

					<label className="flex items-center gap-1 px-2 py-0.5 cursor-pointer text-[color:--text-muted] hover:text-[color:--text-normal]"
						title="Automatically save changes">
						<input type="checkbox" checked={autoSave} onChange={toggleAutoSave} className="cursor-pointer" />
						Auto-save
					</label>

					{hiddenCount > 0 && (
						<button className={btnClass} onClick={toggleShowHidden}>
							{showHidden ? "Hide hidden" : `Show hidden (${hiddenCount})`}
						</button>
					)}
				</div>
			)}
		</div>
	);
}
