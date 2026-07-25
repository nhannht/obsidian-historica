import {useMemo, type ReactNode} from "react";
import {Notice} from "obsidian";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";
import {ExportAsJSONToClipboard, ExportAsMarkdownToClipboard, exportTimelineAsPng, getAllMarkdownFileInVault} from "@/src/utils";
import {NativeContextMenu} from "@/src/ui/NativeContextMenu";
import {FilePicker} from "@/src/ui/FilePicker";

export function TimelineContextMenu(props: {
	children: ReactNode;
	timelineRef: React.RefObject<HTMLDivElement | null>;
}) {
	const {plugin, store} = useTimeline();
	const units = useTimelineStore(s => s.units);
	const settings = useTimelineStore(s => s.settings);
	const isParsing = useTimelineStore(s => s.isParsing);

	const markdownFiles = useMemo(() => getAllMarkdownFileInVault(plugin), [plugin]);

	// exportTimelineAsPng does not catch its own errors in "save" mode, so failures
	// here would otherwise be an unhandled rejection.
	const handleExportPng = (mode: "save" | "clipboard") => {
		if (props.timelineRef.current) {
			exportTimelineAsPng(props.timelineRef.current, mode).catch((error: unknown) => {
				console.error("Historica: failed to export timeline as PNG", error);
				new Notice("Historica: failed to export timeline as PNG");
			});
		}
	};

	// parseFromFile is pulled from store.getState() rather than a reactive selector: it
	// is a stable dispatcher, and selecting a bare method reference (s => s.parseFromFile)
	// trips @typescript-eslint/unbound-method. It can reject, so the failure is surfaced
	// here rather than left as an unhandled rejection.
	const handleParseFile = (path: string) => {
		store.getState().parseFromFile(path).catch((error: unknown) => {
			console.error("Historica: failed to parse file", error);
			new Notice("Historica: failed to parse file");
		});
	};

	return (
		<NativeContextMenu items={[
			{type: "item", label: "Sort", submenu: [
				{type: "item", label: "Ascending", onClick: () => store.getState().sort("asc")},
				{type: "item", label: "Descending", onClick: () => store.getState().sort("desc")},
			]},
			{type: "item", label: "Expand All", onClick: () => store.getState().expandAll(true)},
			{type: "item", label: "Fold All", onClick: () => store.getState().expandAll(false)},
			{type: "item", label: isParsing ? "Parsing..." : "Parse timeline from file", disabled: isParsing, submenuContent: (
				<FilePicker
					files={markdownFiles}
					placeholder="search file path"
					emptyText="No file selected"
					onSelect={(value) => handleParseFile(value)}
				/>
			)},
			{type: "item", label: "Export", submenu: [
				{type: "item", label: "Image (PNG)", submenu: [
					{type: "item", label: "Save as file", onClick: () => handleExportPng("save")},
					{type: "item", label: "Copy to clipboard", onClick: () => handleExportPng("clipboard")},
				]},
				// These export helpers already report their own failures via Notice,
				// so the promise is intentionally not awaited here.
				{type: "item", label: "JSON to clipboard", onClick: () => { void ExportAsJSONToClipboard({units, settings}); }},
				{type: "item", label: "Markdown to clipboard", onClick: () => { void ExportAsMarkdownToClipboard({units, settings}, plugin); }},
			]},
		]}>
			{props.children}
		</NativeContextMenu>
	);
}
