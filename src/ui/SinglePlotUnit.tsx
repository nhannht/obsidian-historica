import {Attachment, TimelineEntry} from "@/src/types";
import {useTimeline, useTimelineStore, useVaultFiles} from "@/src/ui/TimelineContext";
import {generateRandomId, JumpToSource, truncate} from "@/src/utils";
import React, {useState} from "react";
import {MarkdownNote} from "@/src/ui/MarkdownNote";
import {AttachmentPlot, Content} from "@/src/ui/TimelineGeneral";
import {FilePicker} from "@/src/ui/FilePicker";
import {Check} from "@/src/ui/icons";
import {NativeContextMenu} from "@/src/ui/NativeContextMenu";
import {HoverTooltip} from "@/src/ui/HoverTooltip";
import {ManualBadge, AnchorBadge} from "@/src/ui/ManualBadge";
import {SourceFilePill} from "@/src/ui/SourceFilePill";
import {EntryCardUI} from "@/src/ui/EntryCardUI";

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
	const toggleAnchorOnUnit = useTimelineStore(s => s.toggleAnchorOnUnit);

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
	const sig       = props.unit.significance ?? (isAnchor ? 3 : 2)

	const manualBadge = props.unit.manuallyTagged
		? <ManualBadge title="Manually tagged — not auto-extracted"/>
		: null;

	const anchorBadge = isAnchor
		? <AnchorBadge title={`From anchor pack: ${props.unit.filePath}`}/>
		: null;

	const precisionOpacity = props.unit.precision === "full" ? 1 : props.unit.precision === "partial" ? 0.45 : 0.15;
	const isApproximate = props.unit.precision === "approximate";
	const precisionTitle = props.unit.precision === "full"
		? "Precision: full (year, month, day)"
		: props.unit.precision === "partial"
			? "Precision: partial (year certain)"
			: "Precision: approximate (year inferred)";

	const chipVariant = isApproximate ? "approximate" as const : isAnchor ? "anchor" as const : "normal" as const;

	return (
		<EntryCardUI
			expanded={!!props.unit.isExpanded}
			isHidden={isHidden}
			isApproximate={isApproximate}
			precisionOpacity={precisionOpacity}
			precisionTitle={precisionTitle}
			chipVariant={chipVariant}
			chipText={props.unit.parsedResultText}
			badges={<>{manualBadge}{anchorBadge}</>}
			truncatedSentence={truncatedSentence}
			onExpand={() => expandUnit(props.unit, true)}
			onCollapse={() => expandUnit(props.unit, false)}
			onJumpToSource={async () => await JumpToSource(props.unit.nodePos, props.unit.filePath, props.unit.sentence, plugin)}
			sig={sig}
			onSigChange={n => editUnit(props.unit.id, {...props.unit, significance: n as 1|2|3|4|5})}
			contentSlot={
				<NativeContextMenu items={[
					{type: "item", label: "Jump to source", onClick: async () => await JumpToSource(props.unit.nodePos, props.unit.filePath, props.unit.sentence, plugin)},
					{type: "item", label: "Add attachment ›", submenuContent: (
						<FilePicker
							files={allFiles}
							placeholder="Search attachments"
							emptyText="No attachments"
							onSelect={(value) => {
								const existing = props.unit.attachments.find(a => a.path === value);
								if (existing) handleRemoveAttachment(props.unit.id, existing.id);
								else handleAddAttachment(props.unit.id, value);
							}}
							renderItem={(f) => (
								<>
									<Check style={{width: 16, height: 16, marginRight: 8, opacity: props.unit.attachments.some(a => a.path === f.path) ? 1 : 0, flexShrink: 0}}/>
									<HoverTooltip content={<AttachmentPlot path={f.path} plugin={plugin}/>}>
										<div style={{textWrap: "wrap", width: "100%", textAlign: "left"}}>{f.path}</div>
									</HoverTooltip>
								</>
							)}
						/>
					)},
					{type: "separator"},
					{type: "item", label: isHidden ? "Show" : "Hide from view", onClick: () => hideUnit(props.unit.id, !isHidden)},
					{type: "item", label: isAnchor ? "Remove anchor" : "Mark as anchor", onClick: () => toggleAnchorOnUnit(props.unit.id)},
					{type: "item", label: "Dismiss extraction", muted: true, onClick: () => dismissUnit(props.unit.id)},
				]}>
					<Content unit={props.unit} plugin={plugin} handleExpandSingle={(_, isExpanded) => expandUnit(props.unit, isExpanded)}/>
				</NativeContextMenu>
			}
			hasAnnotation={!!annotation.trim()}
			annotationSlot={
				<MarkdownNote
					value={annotation}
					onChange={setAnnotation}
					onBlur={handleAnnotationBlur}
					plugin={plugin}
					sourcePath={props.unit.filePath}
				/>
			}
			sourceFilePill={!props.isSingleFile
				? <SourceFilePill
					path={props.unit.filePath}
					onClick={async () => await JumpToSource(props.unit.nodePos, props.unit.filePath, props.unit.sentence, plugin)}
				/>
				: undefined
			}
		/>
	)
})
