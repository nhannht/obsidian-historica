import {Attachment, TimelineEntry} from "@/src/types";
import {useTimeline, useVaultFiles} from "@/src/ui/TimelineContext";
import {generateRandomId, JumpToSource, truncate} from "@/src/utils";
import React, {useState} from "preact/compat";
import {Notice} from "obsidian";
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
	const {plugin, store} = useTimeline();
	const allFiles = useVaultFiles();

	const [annotation, setAnnotation] = useState(props.unit.annotation ?? "");

	// Actions are pulled from store.getState() rather than a reactive selector: they are
	// stable dispatchers that never need to trigger a re-render, and selecting a bare
	// method reference (s => s.editUnit) trips @typescript-eslint/unbound-method.
	function handleAddAttachment(id: string, filePath: string) {
		const attachments: Attachment[] = props.unit.attachments
		const newAtt: Attachment = {
			id: generateRandomId(),
			path: filePath
		}
		store.getState().editUnit(id, {...props.unit, attachments: [...attachments, newAtt]})
	}

	function handleRemoveAttachment(uId: string, attachmentId: string) {
		const filtered = props.unit.attachments.filter((a) => a.id !== attachmentId)
		store.getState().editUnit(uId, {...props.unit, attachments: filtered})
	}

	function handleAnnotationBlur() {
		const trimmed = annotation.trim();
		if (trimmed !== (props.unit.annotation ?? "").trim()) {
			store.getState().editUnit(props.unit.id, {...props.unit, annotation: trimmed || undefined})
		}
	}

	// JumpToSource can fail (missing file, editor errors) and does not report its own
	// errors, so failures are surfaced here rather than left as an unhandled rejection.
	function handleJumpToSource() {
		JumpToSource(props.unit.nodePos, props.unit.filePath, props.unit.sentence, plugin).catch((error: unknown) => {
			console.error("Historica: failed to jump to source", error);
			new Notice("Historica: failed to jump to source");
		});
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
			onExpand={() => store.getState().expandUnit(props.unit, true)}
			onCollapse={() => store.getState().expandUnit(props.unit, false)}
			onJumpToSource={handleJumpToSource}
			sig={sig}
			onSigChange={n => store.getState().editUnit(props.unit.id, {...props.unit, significance: n as 1|2|3|4|5})}
			contentSlot={
				<NativeContextMenu items={[
					{type: "item", label: "Jump to source", onClick: handleJumpToSource},
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
					{type: "item", label: isHidden ? "Show" : "Hide from view", onClick: () => store.getState().hideUnit(props.unit.id, !isHidden)},
					{type: "item", label: isAnchor ? "Remove anchor" : "Mark as anchor", onClick: () => store.getState().toggleAnchorOnUnit(props.unit.id)},
					{type: "item", label: "Dismiss extraction", muted: true, onClick: () => store.getState().dismissUnit(props.unit.id)},
				]}>
					<Content unit={props.unit} plugin={plugin} handleExpandSingle={(_, isExpanded) => store.getState().expandUnit(props.unit, isExpanded)}/>
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
					onClick={handleJumpToSource}
				/>
				: undefined
			}
		/>
	)
})
