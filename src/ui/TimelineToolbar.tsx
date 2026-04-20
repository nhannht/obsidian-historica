import {useMemo} from "react";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";
import {ExportAsJSONToClipboard, ExportAsMarkdownToClipboard, ExportAsPlainTextToClipboard, exportTimelineAsPng, exportTimelineAsHtml, getAllMarkdownFileInVault} from "@/src/utils";
import {NativeDropdownMenu} from "@/src/ui/NativeDropdownMenu";
import {FilePicker} from "@/src/ui/FilePicker";
import {Spinner} from "@/src/ui/Spinner";
import {TimelineToolbarUI, toolbarBtn, toolbarIconBtn} from "@/src/ui/TimelineToolbarUI";
import {SmallCheck, SmallExport, Refresh} from "@/src/ui/icons";
import {StatusBanner} from "@/src/ui/StatusBanner";

export function TimelineToolbar(props: {
	timelineRef: React.RefObject<HTMLDivElement | null>;
}) {
	const {plugin} = useTimeline();
	const units = useTimelineStore(s => s.units);
	const settings = useTimelineStore(s => s.settings);
	const isDirty = useTimelineStore(s => s.isDirty);
	const isSaving = useTimelineStore(s => s.isSaving);
	const manualSave = useTimelineStore(s => s.manualSave);
	const sort = useTimelineStore(s => s.sort);
	const expandAll = useTimelineStore(s => s.expandAll);
	const showHidden = useTimelineStore(s => s.showHidden);
	const toggleShowHidden = useTimelineStore(s => s.toggleShowHidden);
	const sigFilter = useTimelineStore(s => s.sigFilter);
	const setSigFilter = useTimelineStore(s => s.setSigFilter);
	const parseFromFile = useTimelineStore(s => s.parseFromFile);
	const isParsing = useTimelineStore(s => s.isParsing);
	const isStale = useTimelineStore(s => s.isStale);
	const unparsedSentences = useTimelineStore(s => s.unparsedSentences);

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

	const dates = units.length;
	const totalSentences = units.length + unparsedSentences.length;
	const statsData = totalSentences > 0
		? {dates, sentences: totalSentences, coverage: `${Math.round((dates / totalSentences) * 100)}%`}
		: null;

	return (
		<TimelineToolbarUI
			entryCountText={`${visibleCount} entries${hiddenCount > 0 ? ` (${hiddenCount} hidden)` : ""}`}
			saveStatus={saveStatus}
			saveStatusColor={saveStatusColor}
			saveStatusOpacity={saveStatusOpacity}
			isSaving={isSaving}
			stats={statsData}
			isParsing={isParsing}
			allExpanded={allExpanded}
			hiddenCount={hiddenCount}
			showHidden={showHidden}
			sigFilter={sigFilter}
			isDirty={isDirty}
			onExpandAll={expandAll}
			onToggleShowHidden={toggleShowHidden}
			onSigFilterChange={setSigFilter}
			onSave={() => manualSave()}
			headerExtra={isStale ? (
				<StatusBanner
					icon={<Refresh style={{width: 12, height: 12}}/>}
					message="Source changed"
					variant="muted"
					onClick={() => { const f = plugin.app.workspace.getActiveFile(); if (f) parseFromFile(f.path); }}
				/>
			) : undefined}
			parseSlot={
				<NativeDropdownMenu
					trigger={
						<span style={{display: "inline-flex", alignItems: "center", gap: 4}}>
							{isParsing
								? <Spinner size={9}/>
								: <SmallCheck/>
							}
							{isParsing ? "Parsing…" : "Parse"}
						</span>
					}
					triggerStyle={toolbarBtn}
					disabled={isParsing}

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
			}
			sortSlot={
				<NativeDropdownMenu
					trigger="↑↓ Sort"
					triggerStyle={toolbarBtn}
					items={[
						{type: "item", label: "Ascending",  onClick: () => sort("asc")},
						{type: "item", label: "Descending", onClick: () => sort("desc")},
					]}
				/>
			}
			exportSlot={
				<NativeDropdownMenu
					trigger={<SmallExport/>}
					triggerStyle={toolbarIconBtn}
					items={[
						{type: "item", label: "PNG (save file)",         onClick: () => handleExportPng("save")},
						{type: "item", label: "PNG (clipboard)",         onClick: () => handleExportPng("clipboard")},
						{type: "item", label: "Plain text (clipboard)",  onClick: () => ExportAsPlainTextToClipboard({units, settings})},
						{type: "item", label: "JSON (clipboard)",        onClick: () => ExportAsJSONToClipboard({units, settings})},
						{type: "item", label: "Markdown (clipboard)",    onClick: () => ExportAsMarkdownToClipboard({units, settings}, plugin)},
						{type: "item", label: "HTML (save file)",        onClick: () => exportTimelineAsHtml({units, settings}, plugin)},
					]}
				/>
			}
		/>
	);
}
