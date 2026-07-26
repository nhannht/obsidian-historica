import {useMemo, useState} from "preact/compat";
import {Notice} from "obsidian";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";
import {getAllMarkdownFileInVault} from "@/src/utils";
import {FilePicker} from "@/src/ui/FilePicker";

export function TimelineEmptyState() {
	const {plugin, store} = useTimeline();
	const isParsing = useTimelineStore(s => s.isParsing);

	const [isShowFilePicker, setIsShowFilePicker] = useState(false);
	const markdownFiles = useMemo(() => getAllMarkdownFileInVault(plugin), [plugin]);
	const currentFile = plugin.app.workspace.getActiveFile();

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
		<div style={{padding: "32px 16px", textAlign: "center"}}>
			<div style={{fontSize: 13, color: "var(--int-on-surface-faint)", marginBottom: 8}}>No dates found in this note yet</div>
			<div style={{fontSize: 11, color: "var(--int-on-surface-faint)", opacity: 0.7, lineHeight: 1.5, marginBottom: 14}}>
				Historica reads your existing prose and extracts every date it finds.
			</div>
			{currentFile && (
				<span
					style={{
						display: "inline-block",
						fontSize: 11, fontFamily: "var(--int-font-mono)",
						color: "var(--int-accent-strong)",
						border: "1px solid color-mix(in srgb, var(--int-primary) 40%, transparent)",
						padding: "4px 12px", borderRadius: 3, cursor: isParsing ? "default" : "pointer",
						opacity: isParsing ? 0.5 : 1,
					}}
					onClick={() => !isParsing && handleParseFile(currentFile.path)}
				>{isParsing ? "Parsing…" : "Parse this file"}</span>
			)}
			{!isShowFilePicker ? (
				<div style={{marginTop: 8}}>
					<span
						style={{fontSize: 11, color: "var(--int-on-surface-faint)", opacity: 0.6, cursor: "pointer"}}
						onClick={() => setIsShowFilePicker(true)}
					>or choose another file…</span>
				</div>
			) : (
				<div style={{marginTop: 8}}>
					<FilePicker
						files={markdownFiles}
						placeholder="Search files…"
						emptyText="No files found"
						autoFocus
						onSelect={(value) => {
							setIsShowFilePicker(false);
							handleParseFile(value);
						}}
					/>
				</div>
			)}
		</div>
	);
}
