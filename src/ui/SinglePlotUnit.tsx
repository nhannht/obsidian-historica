import {Attachment, TimelineEntry} from "@/src/types";
import {useTimeline, useTimelineStore} from "@/src/ui/TimelineContext";
import {generateRandomId, GetAllFileInVault, JumpToSource} from "@/src/utils";
import React, {useMemo, useState} from "react";
import {AttachmentPlot, Content} from "@/src/ui/TimelineGeneral";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/src/ui/shadcn/ContextMenu";
import {FilePicker} from "@/src/ui/FilePicker";
import {Check, GripVertical} from "@/src/ui/icons";
import {cn} from "@/src/lib/utils";
import {Badge} from "@/src/ui/shadcn/Badge"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/src/ui/shadcn/Tooltip"

export const SinglePlotUnit = React.memo(function SinglePlotUnit(props: {
	unit: TimelineEntry,
	index: number,
	isSingleFile?: boolean,
	dragHandleProps?: React.HTMLAttributes<HTMLElement>,
}) {
	const {plugin} = useTimeline();
	const allFiles = useMemo(() => GetAllFileInVault(plugin), [plugin]);
	const removeUnit = useTimelineStore(s => s.removeUnit);
	const editUnit = useTimelineStore(s => s.editUnit);
	const expandUnit = useTimelineStore(s => s.expandUnit);
	const hideUnit = useTimelineStore(s => s.hideUnit);

	const [annotation, setAnnotation] = useState(props.unit.annotation ?? "");

	function handleAddAttachment(id: string, filePath: string) {
		const attachments: Attachment[] = props.unit.attachments
		const newAtt: Attachment = {
			id: generateRandomId(),
			path: filePath
		}
		editUnit(id, {...props.unit, attachments: [...attachments, newAtt]})
	}

	function handleRemoveAttachment(uId: string, path: string) {
		const attachments: Attachment[] = props.unit.attachments
		const filtered = attachments.filter((a) => a.path !== path)
		editUnit(uId, {...props.unit, attachments: filtered})
	}

	function handleAnnotationBlur() {
		const trimmed = annotation.trim();
		if (trimmed !== (props.unit.annotation ?? "").trim()) {
			editUnit(props.unit.id, {...props.unit, annotation: trimmed || undefined})
		}
	}

	const truncatedSentence = props.unit.sentence.length > 80
		? props.unit.sentence.slice(0, 80) + "..."
		: props.unit.sentence

	const isHidden  = props.unit.isHidden ?? false
	const isAnchor  = props.unit.isAnchor ?? false

	return (
		<div key={props.unit.id} className={`relative pl-10 py-2 group ${isHidden ? "opacity-40" : ""}`}>
			{/* Timeline line */}
			<div className="absolute left-3 top-0 bottom-0 w-px bg-[--background-modifier-border-hover] group-last:h-4"/>
			{/* Timeline dot — user notes glow; anchors muted */}
			<div className={`absolute left-[7px] top-3 w-3 h-3 rounded-full border-2 ${
				isHidden
					? "border-[--text-muted] bg-[--background-modifier-hover]"
					: isAnchor
						? "border-[--text-faint] bg-[--background-secondary] opacity-60"
						: "border-[--interactive-accent] bg-[--background-primary] ring-2 ring-[--interactive-accent]"
			}`}/>

			{props.dragHandleProps && (
				<div
					className="absolute left-[-2px] top-2.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-40 hover:!opacity-80 touch-none"
					{...props.dragHandleProps}
				>
					<GripVertical width={12} height={12} className="text-[color:--text-muted]"/>
				</div>
			)}

			{/* Compact: chip + sentence preview */}
			{!props.unit.isExpanded && (
				<div
					className="flex items-center gap-2 cursor-pointer hover:bg-[--background-modifier-hover] rounded px-1 py-0.5"
					onClick={() => expandUnit(props.unit.id, true)}
				>
					<span className={`shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[--background-primary-alt] border border-[--background-modifier-border] ${isAnchor ? "text-[color:--text-faint]" : "text-[color:--text-accent]"}`}
					>{props.unit.parsedResultText}</span>
					<span className="text-xs text-[color:--text-muted] truncate">{truncatedSentence}</span>
				</div>
			)}

			{/* Expanded: chip + chevron collapse + jump-to-source icon */}
			{props.unit.isExpanded && (
				<div className="mb-1 flex items-center gap-2">
					<span
						className={`inline-block px-2 py-0.5 text-xs font-semibold rounded bg-[--background-primary-alt] border border-[--background-modifier-border] ${isAnchor ? "text-[color:--text-faint]" : "text-[color:--text-accent]"}`}
					>{props.unit.parsedResultText}</span>
					<span
						className="text-xs text-[color:--text-muted] cursor-pointer hover:text-[color:--text-accent] flex items-center"
						onClick={() => expandUnit(props.unit.id, false)}
						title="Collapse"
					>
						<svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 8L6 4L10 8"/></svg>
					</span>
					<span
						className="text-xs text-[color:--text-muted] cursor-pointer hover:text-[color:--text-accent] flex items-center"
						onClick={async (e) => {
							e.stopPropagation();
							await JumpToSource(props.unit.nodePos, props.unit.filePath, props.unit.sentence, plugin)
						}}
						title="Jump to source"
					>
						<svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 2H2v8h8V7"/><path d="M7 1h4v4"/><line x1="11" y1="1" x2="6" y2="6"/></svg>
					</span>
					<div className="flex items-center gap-0.5 ml-auto" title="Significance (affects visibility at zoom levels)">
						{([1, 2, 3, 4, 5] as const).map(n => {
							const sig = props.unit.significance ?? (isAnchor ? 3 : 1)
							return (
								<button
									key={n}
									className={`w-2 h-2 rounded-full transition-opacity cursor-pointer ${n <= sig ? "bg-[--interactive-accent] opacity-70 hover:opacity-100" : "bg-[--text-faint] opacity-20 hover:opacity-50"}`}
									onClick={e => { e.stopPropagation(); editUnit(props.unit.id, {...props.unit, significance: n}) }}
									title={`Set significance to ${n}`}
								/>
							)
						})}
					</div>
				</div>
			)}

			{/* Sentence content — only when expanded */}
			{props.unit.isExpanded && <ContextMenu>
				<ContextMenuTrigger>
					<Content unit={props.unit} plugin={plugin} handleExpandSingle={expandUnit}/>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onClick={() => removeUnit(props.unit.id)}>Remove</ContextMenuItem>
					<ContextMenuItem onClick={() => hideUnit(props.unit.id, !isHidden)}>{isHidden ? "Show" : "Hide"}</ContextMenuItem>
					<ContextMenuItem onClick={async () => await JumpToSource(props.unit.nodePos, props.unit.filePath, props.unit.sentence, plugin)}>Jump to source</ContextMenuItem>
					<ContextMenuSub>
						<ContextMenuSubTrigger>Add attachment</ContextMenuSubTrigger>
						<ContextMenuSubContent>
							<FilePicker
								className="w-80"
								files={allFiles}
								placeholder="Search attachments"
								emptyText="No attachments"
								onSelect={(value) => {
									if (props.unit.attachments.some(a => a.path === value)) handleRemoveAttachment(props.unit.id, value)
									else handleAddAttachment(props.unit.id, value)
								}}
								renderItem={(f) => (
									<>
										<Check className={cn("mr-2 h-4 w-4", props.unit.attachments.some(a => a.path === f.path) ? "opacity-100" : "opacity-0")}/>
										<TooltipProvider><Tooltip><TooltipTrigger asChild>
											<div className="text-wrap w-full text-left">{f.path}</div>
										</TooltipTrigger><TooltipContent>
											<AttachmentPlot path={f.path} plugin={plugin}/>
										</TooltipContent></Tooltip></TooltipProvider>
									</>
								)}
							/>
						</ContextMenuSubContent>
					</ContextMenuSub>
				</ContextMenuContent>
			</ContextMenu>}

			{/* Inline annotation — only when expanded */}
			{props.unit.isExpanded && (
				<textarea
					className="mt-1 w-full text-xs px-2 py-1 rounded bg-transparent border border-transparent hover:border-[--background-modifier-border] focus:border-[--interactive-accent] focus:outline-none text-[color:--text-muted] focus:text-[color:--text-normal] resize-none placeholder:text-[color:--text-faint] transition-colors"
					rows={1}
					placeholder="Add a note..."
					value={annotation}
					onChange={e => setAnnotation(e.target.value)}
					onBlur={handleAnnotationBlur}
					onInput={e => {
						const el = e.currentTarget;
						el.style.height = "auto";
						el.style.height = el.scrollHeight + "px";
					}}
				/>
			)}

			{/* Source file badge — hidden for single-file or compact */}
			{props.unit.isExpanded && !props.isSingleFile && <div className="mt-1">
				<Badge
					onClick={async () => await JumpToSource(props.unit.nodePos, props.unit.filePath, props.unit.sentence, plugin)}
					className="text-xs hover:cursor-pointer hover:text-[--text-accent-hover] opacity-60 hover:opacity-100"
					variant="outline">{props.unit.filePath}</Badge>
			</div>}
		</div>)
})
