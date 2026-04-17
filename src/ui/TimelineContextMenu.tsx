import {useMemo, type ReactNode} from "react";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";
import {ExportAsJSONToClipboard, ExportAsMarkdownToClipboard, exportTimelineAsPng, getAllMarkdownFileInVault} from "@/src/utils";
import {NativeContextMenu} from "@/src/ui/NativeContextMenu";
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
		<NativeContextMenu items={[
			{type: "item", label: "Sort", submenu: [
				{type: "item", label: "Ascending", onClick: () => sort("asc")},
				{type: "item", label: "Descending", onClick: () => sort("desc")},
			]},
			{type: "item", label: "Expand All", onClick: () => expandAll(true)},
			{type: "item", label: "Fold All", onClick: () => expandAll(false)},
			{type: "item", label: isParsing ? "Parsing..." : "Parse timeline from file", disabled: isParsing, submenuContent: (
				<FilePicker
					files={markdownFiles}
					placeholder="search file path"
					emptyText="No file selected"
					onSelect={(value) => parseFromFile(value)}
				/>
			)},
			{type: "item", label: "Export", submenu: [
				{type: "item", label: "Image (PNG)", submenu: [
					{type: "item", label: "Save as file", onClick: () => handleExportPng("save")},
					{type: "item", label: "Copy to clipboard", onClick: () => handleExportPng("clipboard")},
				]},
				{type: "item", label: "JSON to clipboard", onClick: () => ExportAsJSONToClipboard({units, settings})},
				{type: "item", label: "Markdown to clipboard", onClick: () => ExportAsMarkdownToClipboard({units, settings}, plugin)},
			]},
		]}>
			{props.children}
		</NativeContextMenu>
	);
}
