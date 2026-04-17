import {Attachment, TimelineEntry} from "@/src/types";
import {useTimeline, useTimelineStore, useVaultFiles} from "@/src/ui/TimelineContext";
import {generateRandomId, JumpToSource, truncate} from "@/src/utils";
import React, {useState} from "react";
import {MarkdownNote} from "@/src/ui/MarkdownNote";
import {AttachmentPlot, Content} from "@/src/ui/TimelineGeneral";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/src/ui/shadcn/ContextMenu";
import {FilePicker} from "@/src/ui/FilePicker";
import {Check} from "@/src/ui/icons";
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
}) {
	const {plugin} = useTimeline();
	const allFiles = useVaultFiles();
	const dismissUnit = useTimelineStore(s => s.dismissUnit);
	const editUnit = useTimelineStore(s => s.editUnit);
	const expandUnit = useTimelineStore(s => s.expandUnit);
	const hideUnit = useTimelineStore(s => s.hideUnit);

	const [annotation, setAnnotation] = useState(props.unit.annotation ?? "");
	const [showSigBars, setShowSigBars] = useState(false);

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
	const sigSet    = props.unit.significance !== undefined
	const sig       = props.unit.significance ?? 0

	const manualBadge = props.unit.manuallyTagged
		? <span className="shrink-0 px-1 py-0.5 text-[9px] rounded border border-[--background-modifier-border] text-[color:var(--text-faint)] opacity-70" title="Manually tagged — not auto-extracted">manual</span>
		: null;

	const precisionOpacity = props.unit.precision === "full" ? 1 : props.unit.precision === "partial" ? 0.45 : 0.15;
	const precisionTitle = props.unit.precision === "full"
		? "Precision: full (year, month, day)"
		: props.unit.precision === "partial"
			? "Precision: partial (year certain)"
			: "Precision: approximate (year inferred)";

	return (
		<div key={props.unit.id} className={`relative pl-2 py-1 group ${isHidden ? "opacity-40" : ""}`}>
			<div
				style={{position: "absolute", left: 0, top: 2, bottom: 2, width: 3, backgroundColor: "var(--interactive-accent)", opacity: precisionOpacity, borderRadius: 2}}
				title={precisionTitle}
			/>

			{/* Compact: chip + sentence preview + expand chevron */}
			{!props.unit.isExpanded && (
				<div
					className="flex items-center gap-2 cursor-pointer hover:bg-[--background-modifier-hover] rounded px-1 py-0.5"
					onClick={() => expandUnit(props.unit, true)}
				>
					<span className={`shrink-0 px-1.5 py-0.5 text-[11px] font-mono rounded ${isAnchor ? "bg-[--background-primary-alt]/50 text-[color:--text-faint]" : "bg-[--interactive-accent]/10 text-[color:--text-accent]"}`}
					>{props.unit.parsedResultText}</span>
					{manualBadge}
					<span className="text-xs text-[color:--text-muted] truncate flex-1">{truncatedSentence}</span>
					<svg className="w-3 h-3 shrink-0 opacity-40 group-hover:opacity-70 text-[color:--text-faint]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2L8 6L4 10"/></svg>
				</div>
			)}

			{/* Expanded: card surface wrapping chip + controls + content */}
			{props.unit.isExpanded && (
				<div className="rounded-md border border-[--background-modifier-border] bg-[--background-secondary] px-3 py-2 mt-1">
					{/* Chip — own row above controls */}
					<div className="mb-1.5 flex items-center gap-1.5">
						<span className={`px-2 py-0.5 text-[11px] font-mono rounded ${isAnchor ? "bg-[--background-primary-alt]/50 text-[color:--text-faint]" : "bg-[--interactive-accent]/10 text-[color:--text-accent]"}`}>
							{props.unit.parsedResultText}
						</span>
						{manualBadge}
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
						<div className="flex items-center gap-1.5 ml-auto">
							{!sigSet && !showSigBars && (
								<button
									className="text-[10px] text-[color:var(--text-faint)] opacity-50 hover:opacity-100 hover:text-[color:var(--text-accent)] cursor-pointer px-1 py-0.5 rounded"
									onClick={e => { e.stopPropagation(); setShowSigBars(true); }}
									title="Assign significance"
								>Set sig</button>
							)}
							{(sigSet || showSigBars) && (
								<>
									{sigSet && (
										<span
											style={{width: 5, height: 5, borderRadius: "50%", backgroundColor: "var(--interactive-accent)", opacity: 0.7, flexShrink: 0}}
											title="Significance set by you"
										/>
									)}
									<div className="flex items-end gap-0.5 cursor-pointer" title={sigSet ? `Significance ${sig}/5` : "Click a bar to set"}>
										{([1, 2, 3, 4, 5] as const).map(n => {
											const filled = sigSet && n <= sig;
											return (
												<button
													key={n}
													className="w-2 rounded-sm cursor-pointer transition-all"
													style={{
														height: `${n * 5 + 3}px`,
														backgroundColor: filled ? "var(--interactive-accent)" : "transparent",
														border: `1.5px solid ${filled ? "var(--interactive-accent)" : "color-mix(in srgb, var(--text-faint) 40%, transparent)"}`,
														opacity: filled ? 1 : 0.4,
													}}
													onClick={e => {
														e.stopPropagation();
														editUnit(props.unit.id, {...props.unit, significance: n});
														setShowSigBars(false);
													}}
													title={`Set significance to ${n}/5`}
												/>
											)
										})}
									</div>
								</>
							)}
						</div>
					</div>

					{/* Sentence content */}
					<ContextMenu>
						<ContextMenuTrigger>
							<Content unit={props.unit} plugin={plugin} handleExpandSingle={(_, isExpanded) => expandUnit(props.unit, isExpanded)}/>
						</ContextMenuTrigger>
						<ContextMenuContent>
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
							<ContextMenuSeparator />
							<ContextMenuItem onClick={() => hideUnit(props.unit.id, !isHidden)}>{isHidden ? "Show" : "Hide from view"}</ContextMenuItem>
							<ContextMenuItem onClick={() => dismissUnit(props.unit.id)} className="text-[color:--text-muted]">Dismiss extraction</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>

					{/* Inline annotation */}
					<div
						className="mt-2"
						style={annotation.trim() ? {borderLeft: "2px solid rgba(251,191,36,0.5)", paddingLeft: 10} : {}}
					>
						{annotation.trim() && (
							<span style={{fontSize: 10, fontVariant: "small-caps", color: "var(--text-faint)", letterSpacing: "0.04em"}}>annotation</span>
						)}
						<div style={annotation.trim() ? {fontStyle: "italic"} : {}}>
							<MarkdownNote
								value={annotation}
								onChange={setAnnotation}
								onBlur={handleAnnotationBlur}
								plugin={plugin}
								sourcePath={props.unit.filePath}
							/>
						</div>
					</div>

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
