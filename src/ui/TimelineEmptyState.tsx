import {useMemo, useState} from "react";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";
import {GetAllMarkdownFileInVault} from "@/src/utils";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/src/ui/shadcn/Command";

export function TimelineEmptyState() {
	const {plugin} = useTimeline();
	const parseFromFile = useTimelineStore(s => s.parseFromFile);
	const addUnit = useTimelineStore(s => s.addUnit);

	const [isShowFilePicker, setIsShowFilePicker] = useState(false);
	const markdownFiles = useMemo(() => GetAllMarkdownFileInVault(plugin), [plugin]);
	const currentFile = plugin.app.workspace.getActiveFile();

	const btnBase = "w-64 px-4 py-2 rounded text-sm font-medium cursor-pointer";
	const btnPrimary = `${btnBase} bg-[--interactive-accent] text-[--text-on-accent] hover:opacity-90`;
	const btnSecondary = `${btnBase} border border-[--background-modifier-border] bg-[--background-primary] text-[color:--text-normal] hover:bg-[--background-modifier-hover]`;

	return (
		<div className="p-6 flex flex-col items-center gap-3">
			<p className="text-sm text-[color:--text-muted] mb-2">No timeline entries yet</p>

			{currentFile && (
				<button className={btnPrimary} onClick={() => parseFromFile(currentFile.path)}>
					Parse this file
				</button>
			)}

			{!isShowFilePicker ? (
				<button className={btnSecondary} onClick={() => setIsShowFilePicker(true)}>
					Parse from another file...
				</button>
			) : (
				<div className="w-80">
					<Command>
						<CommandInput placeholder="Search files..." autoFocus />
						<CommandList>
							<CommandEmpty>No files found</CommandEmpty>
							<CommandGroup>
								{markdownFiles.map(f => (
									<CommandItem key={f.path} value={f.path}
										onSelect={async (value) => {
											setIsShowFilePicker(false);
											await parseFromFile(value);
										}}>{f.path}</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</div>
			)}

			<button className={btnSecondary} onClick={() => addUnit(0)}>
				Add entry manually
			</button>
		</div>
	);
}
