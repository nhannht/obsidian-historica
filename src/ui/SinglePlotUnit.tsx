import {Attachment, TimelineEntry} from "@/src/types";
import {useTimeline, useTimelineStore, useVaultFiles} from "@/src/ui/TimelineContext";
import {entrySig, generateRandomId, JumpToSource, truncate} from "@/src/utils";
import React, {useState} from "react";
import {MarkdownNote} from "@/src/ui/MarkdownNote";
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
	const allFiles = useVaultFiles();
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

	function handleRemoveAttachment(uId: string, attachmentId: string) {
		const filtered = props.unit.attachments.filter((a) => a.id !== attachmentId)
		editUnit(uId, {...props.unit, attachments: filtered})
	}

	function handleAnnotationBlur() {
		const trimmed = annotation.trim();
		if (trimmed !== (props.unit.annotation ?? "").trim()) {
			editUnit(props.unit.id, {...props.unit, annotation: trimmed || undefined})
		}
	}

	const truncatedSentence = truncate(props.unit.sentence, 80)

	const isHidden  = props.unit.isHidden ?? false
	const isAnchor  = props.unit.isAnchor ?? false
	const sig       = entrySig(props.unit)

	return (
		<div key={props.unit.id} className={`relative pl-2 py-1 group ${isHidden ? "opacity-40" : ""}`}>
			{props.dragHandleProps && (
				<div
					className="absolute left-0 top-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-40 hover:!opacity-80 touch-none"
					{...props.dragHandleProps}
				>
					<GripVertical width={12} height={12} className="text-[color:--text-muted]"/>
				</div>
			)}

			{/* Compact: chip + sentence preview + expand chevron */}
			{!props.unit.isExpanded && (
				<div
					className="flex items-center gap-2 cursor-pointer hover:bg-[--background-modifier-hover] rounded px-1 py-0.5"
					onClick={() => expandUnit(props.unit, true)}
				>
					<span className={`shrink-0 px-1.5 py-0.5 text-[11px] font-mono rounded ${isAnchor ? "bg-[--background-primary-alt]/50 text-[color:--text-faint]" : "bg-[--interactive-accent]/10 text-[color:--text-accent]"}`}
					>{props.unit.parsedResultText}</span>
					<span className="text-xs text-[color:--text-muted] truncate flex-1">{truncatedSentence}</span>
					<svg className="w-3 h-3 shrink-0 opacity-40 group-hover:opacity-70 text-[color:--text-faint]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2L8 6L4 10"/></svg>
				</div>
			)}

			{/* Expanded: card surface wrapping chip + controls + content */}
			{props.unit.isExpanded && (
				<div className="rounded-md border border-[--background-modifier-border] bg-[--background-secondary] px-3 py-2 mt-1">
					{/* Chip — own row above controls */}
					<div className="mb-1.5">
						<span className={`px-2 py-0.5 text-[11px] font-mono rounded ${isAnchor ? "bg-[--background-primary-alt]/50 text-[color:--text-faint]" : "bg-[--interactive-accent]/10 text-[color:--text-accent]"}`}>
							{props.unit.parsedResultText}
						</span>
					</div>

					{/* Controls row: collapse + jump + sig dots */}
					<div className="flex items-center gap-2 mb-2">
						<span
							className="text-xs text-[color:--text-muted] cursor-pointer hover:text-[color:--text-accent] flex items-center"
							onClick={() => expandUnit(props.unit, false)}
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
						<div className="flex items-end gap-0.5 ml-auto cursor-pointer" title="Significance (affects visibility at zoom levels)">
							{([1, 2, 3, 4, 5] as const).map(n => {
								const filled = n <= sig
								return (
									<button
										key={n}
										className="w-2 rounded-sm cursor-pointer transition-all"
										style={{
											height: `${n * 5 + 3}px`,
											backgroundColor: filled ? "var(--interactive-accent)" : "transparent",
											border: `1.5px solid ${filled ? "var(--interactive-accent)" : "color-mix(in srgb, var(--text-faint) 40%, transparent)"}`,
											opacity: filled ? 1 : 0.6,
										}}
										onClick={e => { e.stopPropagation(); editUnit(props.unit.id, {...props.unit, significance: n}) }}
										title={`Significance ${n}/5`}
									/>
								)
							})}
						</div>
					</div>

					{/* Sentence content */}
					<ContextMenu>
						<ContextMenuTrigger>
							<Content unit={props.unit} plugin={plugin} handleExpandSingle={(_, isExpanded) => expandUnit(props.unit, isExpanded)}/>
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
											const existing = props.unit.attachments.find(a => a.path === value)
											if (existing) handleRemoveAttachment(props.unit.id, existing.id)
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
					</ContextMenu>

					{/* Inline annotation */}
					<MarkdownNote
						value={annotation}
						onChange={setAnnotation}
						onBlur={handleAnnotationBlur}
						plugin={plugin}
						sourcePath={props.unit.filePath}
					/>

					{/* Source file badge */}
					{!props.isSingleFile && <div className="mt-1.5">
						<Badge
							onClick={async () => await JumpToSource(props.unit.nodePos, props.unit.filePath, props.unit.sentence, plugin)}
							className="text-xs hover:cursor-pointer hover:text-[--text-accent-hover] opacity-60 hover:opacity-100"
							variant="outline">{props.unit.filePath}</Badge>
					</div>}
				</div>
			)}
		</div>)
})
