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

	const btnBase = "w-64 px-4 py-2 rounded text-sm font-medium cursor-pointer";
	const btnPrimary = `${btnBase} bg-[--interactive-accent] text-[--text-on-accent] hover:opacity-90`;
	const btnSecondary = `${btnBase} border border-[--background-modifier-border] bg-[--background-primary] text-[color:--text-normal] hover:bg-[--background-modifier-hover]`;

	return (
		<div className="p-6 flex flex-col items-center gap-3">
			<p className="text-sm text-[color:--text-muted]">No dates found yet</p>
			<p className="text-xs text-[color:--text-muted] opacity-70 text-center max-w-xs mb-2">Historica reads your existing prose and extracts every date it finds. It does not create entries — parse a note that contains dates in its text.</p>

			{currentFile && (
				<button className={btnPrimary} disabled={isParsing} onClick={() => parseFromFile(currentFile.path)}>
					{isParsing ? "Parsing..." : "Parse this file"}
				</button>
			)}

			{!isShowFilePicker ? (
				<button className={btnSecondary} disabled={isParsing} onClick={() => setIsShowFilePicker(true)}>
					Parse from another file...
				</button>
			) : (
				<FilePicker
					className="w-80"
					files={markdownFiles}
					placeholder="Search files..."
					emptyText="No files found"
					autoFocus
					onSelect={async (value) => {
						setIsShowFilePicker(false);
						await parseFromFile(value);
					}}
				/>
			)}
		</div>
	);
}
