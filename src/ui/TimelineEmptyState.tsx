import {useMemo, useState} from "react";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";
import {getAllMarkdownFileInVault} from "@/src/utils";
import {FilePicker} from "@/src/ui/FilePicker";

export function TimelineEmptyState() {
	const {plugin} = useTimeline();
	const parseFromFile = useTimelineStore(s => s.parseFromFile);
	const isParsing = useTimelineStore(s => s.isParsing);

	const [isShowFilePicker, setIsShowFilePicker] = useState(false);
	const markdownFiles = useMemo(() => getAllMarkdownFileInVault(plugin), [plugin]);
	const currentFile = plugin.app.workspace.getActiveFile();

	return (
		<div style={{padding: "32px 16px", textAlign: "center"}}>
			<div style={{fontSize: 13, color: "var(--text-faint)", marginBottom: 8}}>No dates found in this note yet</div>
			<div style={{fontSize: 11, color: "var(--text-faint)", opacity: 0.7, lineHeight: 1.5, marginBottom: 14}}>
				Historica reads your existing prose and extracts every date it finds.
			</div>
			{currentFile && (
				<span
					style={{
						display: "inline-block",
						fontSize: 11, fontFamily: "monospace",
						color: "var(--text-accent)",
						border: "1px solid color-mix(in srgb, var(--interactive-accent) 40%, transparent)",
						padding: "4px 12px", borderRadius: 3, cursor: isParsing ? "default" : "pointer",
						opacity: isParsing ? 0.5 : 1,
					}}
					onClick={() => !isParsing && parseFromFile(currentFile.path)}
				>{isParsing ? "Parsing…" : "Parse this file"}</span>
			)}
			{!isShowFilePicker ? (
				<div style={{marginTop: 8}}>
					<span
						style={{fontSize: 11, color: "var(--text-faint)", opacity: 0.6, cursor: "pointer"}}
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
						onSelect={async (value) => {
							setIsShowFilePicker(false);
							await parseFromFile(value);
						}}
					/>
				</div>
			)}
		</div>
	);
}
