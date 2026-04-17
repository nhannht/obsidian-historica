import {useMemo, type ReactNode} from "react";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";
import {ExportAsJSONToClipboard, ExportAsMarkdownToClipboard, exportTimelineAsPng, getAllMarkdownFileInVault} from "@/src/utils";
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
}) {
	const {plugin} = useTimeline();
	const units = useTimelineStore(s => s.units);
	const settings = useTimelineStore(s => s.settings);
	const sort = useTimelineStore(s => s.sort);
	const expandAll = useTimelineStore(s => s.expandAll);
	const parseFromFile = useTimelineStore(s => s.parseFromFile);
	const isParsing = useTimelineStore(s => s.isParsing);

	const markdownFiles = useMemo(() => getAllMarkdownFileInVault(plugin), [plugin]);

	const handleExportPng = (mode: "save" | "clipboard") => {
		if (props.timelineRef.current) exportTimelineAsPng(props.timelineRef.current, mode);
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger>{props.children}</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuSub>
					<ContextMenuSubTrigger>Sort</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						<ContextMenuItem onClick={() => sort("asc")}>Ascending</ContextMenuItem>
						<ContextMenuItem onClick={() => sort("desc")}>Descending</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
				<ContextMenuItem onClick={() => expandAll(true)}>Expand All</ContextMenuItem>
				<ContextMenuItem onClick={() => expandAll(false)}>Fold All</ContextMenuItem>
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
			</ContextMenuContent>
		</ContextMenu>
	);
}
