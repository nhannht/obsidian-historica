import {Attachment, TimelineEntry} from "@/src/types";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";
import {FormatDate, GenerateRandomId, GetAllFileInVault, JumpToSource} from "@/src/utils";
import {useState} from "react";
import {AttachmentPlot, Content} from "@/src/ui/TimelineGeneral";
import SinglePlotUnitNgEditor from "@/src/ui/SinglePlotUnitEditor";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/src/ui/shadcn/ContextMenu";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from "@/src/ui/shadcn/Command"
import {Check} from "@/src/ui/icons";
import {cn} from "@/src/lib/utils";
import {Badge} from "@/src/ui/shadcn/Badge"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/src/ui/shadcn/Tooltip"
export function SinglePlotUnit(props: {
	u: TimelineEntry,
	index: number,
	isSingleFile?: boolean,
}) {
	const {plugin} = useTimeline();
	const removeUnit = useTimelineStore(s => s.removeUnit);
	const editUnit = useTimelineStore(s => s.editUnit);
	const addUnit = useTimelineStore(s => s.addUnit);
	const moveUnit = useTimelineStore(s => s.moveUnit);
	const expandUnit = useTimelineStore(s => s.expandUnit);
	const hideUnit = useTimelineStore(s => s.hideUnit);

	const [mode, setMode] = useState<"normal" | "edit">("normal")


	function handleModeChange(mode: "normal" | "edit") {
		setMode(mode)
	}

	function handleMove(i: number, d: "up" | "down") {
		moveUnit(i, d)
	}

	function handleAddAttachment(id: string, filePath: string) {
		let as: Attachment[] = props.u.attachments
		let newAtt: Attachment = {
			id: GenerateRandomId(),
			path: filePath
		}
		editUnit(id, {...props.u, attachments: [...as, newAtt]})
	}

	function handleRemoveAttachment(uId: string, path: string) {
		let as: Attachment[] = props.u.attachments
		let newAtts = as.filter((a) => a.path !== path)
		editUnit(uId, {...props.u, attachments: newAtts})

	}

	function handleChangePath(uId: string, newPath: string) {
		editUnit(uId, {...props.u, filePath: newPath})
	}


	const truncatedSentence = props.u.sentence.length > 80
		? props.u.sentence.slice(0, 80) + "..."
		: props.u.sentence

	const isHidden = props.u.isHidden ?? false

	if (mode === "normal") {
		return (
			<div key={props.u.id} className={`relative pl-10 py-2 group ${isHidden ? "opacity-40" : ""}`}>
				{/* Timeline line */}
				<div className="absolute left-3 top-0 bottom-0 w-px bg-[--background-modifier-border-hover] group-last:h-4"/>
				{/* Timeline dot */}
				<div className={`absolute left-[7px] top-3 w-3 h-3 rounded-full border-2 ${isHidden ? "border-[--text-muted] bg-[--background-modifier-hover]" : "border-[--interactive-accent] bg-[--background-primary]"}`}/>

				{/* Compact: single line with date chip + title + preview */}
				{!props.u.isExpanded && (
					<div
						className="flex items-center gap-2 cursor-pointer hover:bg-[--background-modifier-hover] rounded px-1 py-0.5"
						onClick={() => expandUnit(props.u.id, true)}
					>
						<span className="shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[--background-primary-alt] text-[color:--text-accent] border border-[--background-modifier-border]"
						>{FormatDate(props.u.time)}</span>
						<span className="font-medium text-sm text-[color:--text-normal] hover:text-[color:--text-accent]"
							title="Click to jump to source"
							onClick={async (e) => {
								e.stopPropagation();
								await JumpToSource(props.u.nodePos, props.u.filePath, props.u.sentence, plugin)
							}}
						>{props.u.parsedResultText}</span>
						<span className="text-xs text-[color:--text-muted] truncate">{truncatedSentence}</span>
					</div>
				)}

				{/* Expanded: full detail */}
				{props.u.isExpanded && <>
					{/* Date chip */}
					<div className="mb-1 flex items-center gap-2">
						<span
							className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-[--background-primary-alt] text-[color:--text-accent] border border-[--background-modifier-border]"
						>{FormatDate(props.u.time)}</span>
						<span
							className="text-xs text-[color:--text-muted] cursor-pointer hover:text-[color:--text-accent]"
							onClick={() => expandUnit(props.u.id, false)}
						>collapse</span>
					</div>

					{/* Title */}
					<div
						className="font-medium text-base text-[color:--text-normal] cursor-pointer hover:text-[color:--text-accent]"
						onClick={async () => {
							await JumpToSource(props.u.nodePos, props.u.filePath, props.u.sentence, plugin)
						}}
						title="Click to jump to source"
					>{props.u.parsedResultText}</div>
				</>}

				{/* Sentence content — only when expanded */}
				{props.u.isExpanded && <ContextMenu>
					<ContextMenuTrigger>
						<Content unit={props.u} plugin={plugin} handleExpandSingle={expandUnit}/>
					</ContextMenuTrigger>
					<ContextMenuContent>
						<ContextMenuItem onClick={() => { addUnit(props.index); handleModeChange("edit") }}>Add entry</ContextMenuItem>
						<ContextMenuItem onClick={() => removeUnit(props.u.id)}>Remove</ContextMenuItem>
						<ContextMenuItem onClick={() => handleModeChange("edit")}>Edit</ContextMenuItem>
						<ContextMenuItem onClick={() => hideUnit(props.u.id, !isHidden)}>{isHidden ? "Show" : "Hide"}</ContextMenuItem>
						<ContextMenuItem onClick={() => expandUnit(props.u.id, !props.u.isExpanded)}>Fold/Unfold</ContextMenuItem>
						<ContextMenuItem onClick={async () => await JumpToSource(props.u.nodePos, props.u.filePath, props.u.sentence, plugin)}>Jump to source</ContextMenuItem>
						<ContextMenuItem onClick={() => handleMove(props.index, "up")}>Move up</ContextMenuItem>
						<ContextMenuItem onClick={() => handleMove(props.index, "down")}>Move down</ContextMenuItem>
						<ContextMenuSub>
							<ContextMenuSubTrigger>Add attachment</ContextMenuSubTrigger>
							<ContextMenuSubContent>
								<Command className="w-80">
									<CommandInput placeholder="Search attachments"/>
									<CommandList>
										<CommandEmpty>No attachments</CommandEmpty>
										<CommandGroup title="" content="">
											{GetAllFileInVault(plugin).map((f) => (
												<CommandItem key={f.path} value={f.path}
													onSelect={() => {
														if (props.u.attachments.some(a => a.path === f.path)) handleRemoveAttachment(props.u.id, f.path)
														else handleAddAttachment(props.u.id, f.path)
													}}>
													<Check className={cn("mr-2 h-4 w-4", props.u.attachments.some(a => a.path === f.path) ? "opacity-100" : "opacity-0")}/>
													<TooltipProvider><Tooltip><TooltipTrigger asChild>
														<div className="text-wrap w-full text-left">{f.path}</div>
													</TooltipTrigger><TooltipContent>
														<AttachmentPlot path={f.path} plugin={plugin}/>
													</TooltipContent></Tooltip></TooltipProvider>
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</ContextMenuSubContent>
						</ContextMenuSub>
						<ContextMenuSub>
							<ContextMenuSubTrigger>Change source file</ContextMenuSubTrigger>
							<ContextMenuSubContent>
								<Command className="w-80">
									<CommandInput placeholder="Search for source file"/>
									<CommandList>
										<CommandEmpty>No file</CommandEmpty>
										<CommandGroup>
											{GetAllFileInVault(plugin).map((f) => (
												<CommandItem key={f.path} value={f.path}
													onSelect={() => handleChangePath(props.u.id, f.path)}>
													<Check className={cn("mr-2 h-4 w-4", props.u.filePath === f.path ? "opacity-100" : "opacity-0")}/>
													<div className="text-wrap w-full text-left">{f.path}</div>
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</ContextMenuSubContent>
						</ContextMenuSub>
					</ContextMenuContent>
				</ContextMenu>}

				{/* Source file badge — hidden for single-file or compact */}
				{props.u.isExpanded && !props.isSingleFile && <div className="mt-1">
					<Badge
						onClick={async () => await JumpToSource(props.u.nodePos, props.u.filePath, props.u.sentence, plugin)}
						className="text-xs hover:cursor-pointer hover:text-[--text-accent-hover] opacity-60 hover:opacity-100"
						variant="outline">{props.u.filePath}</Badge>
				</div>}
			</div>)
	} else if (mode === "edit") {
		return <SinglePlotUnitNgEditor key={props.u.id} handleModeChange={handleModeChange} u={props.u}
									   handleEditPlotUnit={editUnit}/>
	} else {
		return <div key={props.u.id}></div>
	}

}
