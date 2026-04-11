import {useMemo, type ReactNode} from "react";
import {Notice, TFile} from "obsidian";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";
import {ExportAsJSONToClipboard, ExportAsMarkdownToClipboard, exportTimelineAsPng, GetAllHistoricaDataFile, getAllMarkdownFileInVault} from "@/src/utils";
import {dataFilePath} from "@/src/data/TimelineDataManager";
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

export function TimelineContextMenu(props: {
	children: ReactNode;
	timelineRef: React.RefObject<HTMLDivElement | null>;
	onShowHeaderEditor: () => void;
	onShowFooterEditor: () => void;
}) {
	const {plugin} = useTimeline();
	const units = useTimelineStore(s => s.units);
	const settings = useTimelineStore(s => s.settings);
	const showHidden = useTimelineStore(s => s.showHidden);
	const manualSave = useTimelineStore(s => s.manualSave);
	const sort = useTimelineStore(s => s.sort);
	const expandAll = useTimelineStore(s => s.expandAll);
	const toggleShowHidden = useTimelineStore(s => s.toggleShowHidden);
	const removeAll = useTimelineStore(s => s.removeAll);
	const parseFromFile = useTimelineStore(s => s.parseFromFile);
	const importFromTimeline = useTimelineStore(s => s.importFromTimeline);
	const isParsing = useTimelineStore(s => s.isParsing);

	const markdownFiles = useMemo(() => getAllMarkdownFileInVault(plugin), [plugin]);
	const hiddenCount = units.filter(u => u.isHidden).length;

	const handleExportPng = (mode: "save" | "clipboard") => {
		if (props.timelineRef.current) exportTimelineAsPng(props.timelineRef.current, mode);
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger>{props.children}</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={() => manualSave()}>Save</ContextMenuItem>
				<ContextMenuSub>
					<ContextMenuSubTrigger>Edit decorations</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						<ContextMenuItem onClick={props.onShowHeaderEditor}>Header</ContextMenuItem>
						<ContextMenuItem onClick={props.onShowFooterEditor}>Footer</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
				<ContextMenuSub>
					<ContextMenuSubTrigger>Sort</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						<ContextMenuItem onClick={() => sort("asc")}>Ascending</ContextMenuItem>
						<ContextMenuItem onClick={() => sort("desc")}>Descending</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
				<ContextMenuItem onClick={() => expandAll(true)}>Expand All</ContextMenuItem>
				<ContextMenuItem onClick={() => expandAll(false)}>Fold All</ContextMenuItem>
				<ContextMenuItem onClick={toggleShowHidden}>
					{showHidden ? "Hide hidden entries" : `Show hidden entries${hiddenCount > 0 ? ` (${hiddenCount})` : ""}`}
				</ContextMenuItem>
				<ContextMenuItem onClick={removeAll}>Remove All</ContextMenuItem>
				<ContextMenuSub>
					<ContextMenuSubTrigger disabled={isParsing}>{isParsing ? "Parsing..." : "Parse timeline from file"}</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						<FilePicker
							files={markdownFiles}
							placeholder="search file path"
							emptyText="No file selected"
							onSelect={(value) => parseFromFile(value)}
						/>
					</ContextMenuSubContent>
				</ContextMenuSub>
				<ContextMenuSub>
					<ContextMenuSubTrigger>Export</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						<ContextMenuSub>
							<ContextMenuSubTrigger>Image (PNG)</ContextMenuSubTrigger>
							<ContextMenuSubContent>
								<ContextMenuItem onClick={() => handleExportPng("save")}>Save as file</ContextMenuItem>
								<ContextMenuItem onClick={() => handleExportPng("clipboard")}>Copy to clipboard</ContextMenuItem>
							</ContextMenuSubContent>
						</ContextMenuSub>
						<ContextMenuItem onClick={() => ExportAsJSONToClipboard({units, settings})}>
							JSON to clipboard
						</ContextMenuItem>
						<ContextMenuItem onClick={() => ExportAsMarkdownToClipboard({units, settings}, plugin)}>
							Markdown to clipboard
						</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
				<ContextMenuSub>
					<ContextMenuSubTrigger>Import from timeline</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						<FilePicker
							files={GetAllHistoricaDataFile(plugin)}
							placeholder="pick file to import"
							emptyText="No file selected"
							onSelect={(value) => importFromTimeline(value)}
						/>
					</ContextMenuSubContent>
				</ContextMenuSub>
					{settings.blockId !== "-1" && (
					<ContextMenuItem onClick={async () => {
						const dataPath = dataFilePath(settings.blockId);
						const file = plugin.app.vault.getAbstractFileByPath(dataPath);
						if (file instanceof TFile) {
							await plugin.app.workspace.openLinkText(dataPath, "", true);
						} else {
							new Notice("Data file not found — save the timeline first");
						}
					}}>Reveal data file</ContextMenuItem>
				)}
			</ContextMenuContent>
		</ContextMenu>
	);
}
