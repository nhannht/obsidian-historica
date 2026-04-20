import {ReactNode} from "react";
import {PrecisionGutter} from "./PrecisionGutter";
import {DateChip} from "./DateChip";
import {SignalBars} from "./SignalBars";
import {AnnotationBlock} from "./AnnotationBlock";
import {ChevronRight, ChevronUp, ExternalLink} from "./icons";

export interface EntryCardUIProps {
	/* State */
	expanded: boolean;
	isHidden?: boolean;
	isApproximate?: boolean;

	/* Precision gutter */
	precisionOpacity: number;
	precisionTitle?: string;

	/* Chip row */
	chipVariant: "normal" | "approximate" | "anchor";
	chipText: string;
	badges?: ReactNode;

	/* Collapsed */
	truncatedSentence?: string;
	onExpand?: () => void;

	/* Expanded — controls */
	onCollapse?: () => void;
	onJumpToSource?: () => void;
	sig?: number;
	onSigChange?: (n: number) => void;

	/* Expanded — content (production passes NativeContextMenu-wrapped Content) */
	contentSlot?: ReactNode;

	/* Expanded — annotation */
	hasAnnotation?: boolean;
	annotationSlot?: ReactNode;

	/* Expanded — source file */
	sourceFilePill?: ReactNode;
}

export function EntryCardUI({
	expanded,
	isHidden = false,
	isApproximate = false,
	precisionOpacity,
	precisionTitle,
	chipVariant,
	chipText,
	badges,
	truncatedSentence,
	onExpand,
	onCollapse,
	onJumpToSource,
	sig = 2,
	onSigChange,
	contentSlot,
	hasAnnotation = false,
	annotationSlot,
	sourceFilePill,
}: EntryCardUIProps) {
	return (
		<div className={`relative pl-2 py-1 group ${isHidden ? "opacity-40" : ""}`}>
			<PrecisionGutter opacity={precisionOpacity} title={precisionTitle}/>

			{/* Compact: chip + sentence preview + expand chevron */}
			{!expanded && (
				<div
					className="flex items-center gap-2 cursor-pointer hover:bg-[--background-modifier-hover] rounded px-1 py-0.5"
					onClick={onExpand}
				>
					<DateChip variant={chipVariant}>{chipText}</DateChip>
					{badges}
					<span className="text-xs text-[color:--text-muted] truncate flex-1">{truncatedSentence}</span>
					<ChevronRight className="w-3 h-3 shrink-0 opacity-40 group-hover:opacity-70 text-[color:--text-faint]"/>
				</div>
			)}

			{/* Expanded: card surface wrapping chip + controls + content */}
			{expanded && (
				<div style={{
					borderRadius: 5, padding: "8px 12px", marginTop: 4,
					border: isApproximate ? "1px dashed var(--background-modifier-border)" : "1px solid var(--background-modifier-border)",
					background: isApproximate ? "transparent" : "var(--background-secondary)",
				}}>
					{/* Chip row */}
					<div className="mb-1.5 flex items-center gap-1.5">
						<DateChip variant={chipVariant}>{chipText}</DateChip>
						{badges}
					</div>

					{/* Controls row: collapse + jump + sig */}
					<div className="flex items-center gap-2 mb-2">
						<span
							className="text-xs text-[color:--text-muted] cursor-pointer hover:text-[color:--text-accent] flex items-center"
							onClick={onCollapse}
							title="Collapse"
						>
							<ChevronUp className="w-3 h-3"/>
						</span>
						<span
							className="text-xs text-[color:--text-muted] cursor-pointer hover:text-[color:--text-accent] flex items-center"
							onClick={onJumpToSource}
							title="Jump to source"
						>
							<ExternalLink className="w-3 h-3"/>
						</span>
						<div className="flex items-center gap-1.5 ml-auto">
							<SignalBars sig={sig} onBarClick={onSigChange}/>
						</div>
					</div>

					{/* Content */}
					<div style={isApproximate ? {opacity: 0.7} : {}}>
						{contentSlot}
					</div>

					{/* Annotation */}
					<AnnotationBlock hasContent={hasAnnotation}>
						{annotationSlot}
					</AnnotationBlock>

					{/* Source file */}
					{sourceFilePill && <div className="mt-1.5">{sourceFilePill}</div>}
				</div>
			)}
		</div>
	);
}
