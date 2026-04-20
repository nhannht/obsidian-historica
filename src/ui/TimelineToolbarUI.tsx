import {CSSProperties, ReactNode, useState} from "react";
import {Spinner} from "./Spinner";
import {SIG_LEVELS} from "./constants";
import {SmallCheck, SmallChevronDown, SmallExport, SmallSave} from "./icons";
import {StatPill} from "./StatPill";

/* ── Shared style tokens (exported for rare cases needing toolbar-consistent styling) ── */

export const toolbarBtn: CSSProperties = {
	fontSize: 11, padding: "2px 6px", borderRadius: 3,
	color: "var(--text-muted)", cursor: "pointer",
	border: "1px solid transparent", background: "transparent",
	boxShadow: "none",
};

export const toolbarIconBtn: CSSProperties = {
	display: "flex", alignItems: "center", justifyContent: "center",
	width: 22, height: 22, borderRadius: 3,
	color: "var(--text-muted)", cursor: "pointer",
	background: "transparent", boxShadow: "none",
	border: "none", padding: 0,
};

const DIVIDER = <div style={{width: 1, height: 14, background: "var(--background-modifier-border)", margin: "0 2px", flexShrink: 0}}/>;

/* ── SigDots (inline, not a separate file) ── */

function SigDots({value, onChange}: {value: number; onChange?: (threshold: number) => void}) {
	const isFiltering = value !== 1;
	return (
		<div style={{display: "flex", alignItems: "center", gap: 3}}>
			{SIG_LEVELS.map(n => {
				const filled = isFiltering && n <= value;
				return (
					<div
						key={n}
						onClick={onChange ? () => onChange(value === n ? 1 : n) : undefined}
						title={n === value ? "Clear filter" : `Show sig ≥ ${n}`}
						style={{
							width: 7, height: 7, borderRadius: "50%",
							background: filled ? "var(--interactive-accent)" : "transparent",
							border: `1.5px solid ${filled ? "var(--interactive-accent)" : "var(--text-faint)"}`,
							cursor: onChange ? "pointer" : "default",
						}}
					/>
				);
			})}
			{isFiltering && onChange && (
				<span
					onClick={() => onChange(1)}
					title="Clear sig filter"
					style={{fontSize: 9, color: "var(--text-faint)", cursor: "pointer", marginLeft: 2, lineHeight: 1}}
				>×</span>
			)}
		</div>
	);
}

/* ── TimelineToolbarUI ── */

export interface TimelineToolbarUIProps {
	/* Header */
	entryCountText: string;
	saveStatus: string;
	saveStatusColor?: string;
	saveStatusOpacity?: number;
	isSaving?: boolean;

	/* Stats row */
	stats?: {dates: number; sentences: number; coverage: string} | null;

	/* Controls */
	isParsing?: boolean;
	allExpanded?: boolean;
	hiddenCount?: number;
	showHidden?: boolean;
	sigFilter?: number;
	isDirty?: boolean;

	/* Callbacks — all optional so gallery can render without them */
	onParse?: () => void;
	onExpandAll?: (expand: boolean) => void;
	onToggleShowHidden?: () => void;
	onSigFilterChange?: (threshold: number) => void;
	onSave?: () => void;

	/** Extra element after Historica label (e.g. stale indicator) */
	headerExtra?: ReactNode;

	/** Slot for parse dropdown — production passes NativeDropdownMenu, gallery can pass a simple button */
	parseSlot?: ReactNode;
	/** Slot for sort dropdown */
	sortSlot?: ReactNode;
	/** Slot for export dropdown */
	exportSlot?: ReactNode;

	/** Content below the toolbar (e.g. entry list in BlockTimeline) */
	children?: ReactNode;

	/** Start collapsed */
	defaultCollapsed?: boolean;
}

export function TimelineToolbarUI({
	entryCountText,
	saveStatus,
	saveStatusColor = "var(--text-muted)",
	saveStatusOpacity = 0.6,
	isSaving = false,
	stats,
	isParsing = false,
	allExpanded = false,
	hiddenCount = 0,
	showHidden = false,
	sigFilter = 1,
	isDirty = false,
	onParse,
	onExpandAll,
	onToggleShowHidden,
	onSigFilterChange,
	onSave,
	headerExtra,
	parseSlot,
	sortSlot,
	exportSlot,
	children,
	defaultCollapsed = false,
}: TimelineToolbarUIProps) {
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

	/* Fallback simple buttons when no slot is provided */
	const parseButton = parseSlot ?? (
		<span
			style={{...toolbarBtn, display: "inline-flex", alignItems: "center", gap: 4}}
			onClick={onParse}
		>
			{isParsing ? <Spinner size={9}/> : <SmallCheck/>}
			{isParsing ? "Parsing…" : "Parse"}
		</span>
	);

	const sortButton = sortSlot ?? (
		<span style={toolbarBtn}>↑↓ Sort</span>
	);

	const exportButton = exportSlot ?? (
		<span style={toolbarIconBtn} title="Export"><SmallExport/></span>
	);

	return (
		<div style={{
			border: "1px solid var(--background-modifier-border)",
			borderRadius: 5, overflow: "hidden",
		}}>
			{/* Header row */}
			<div style={{
				display: "flex", alignItems: "center", justifyContent: "space-between",
				padding: "5px 10px",
				borderBottom: isCollapsed ? undefined : "1px solid var(--background-modifier-border)",
			}}>
				<div style={{display: "flex", alignItems: "center", gap: 6}}>
					<span
						style={{fontSize: 12, fontWeight: 600, color: "var(--text-normal)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4}}
						onClick={() => setIsCollapsed(c => !c)}
					>
						Historica
						<span style={{transition: "transform 110ms", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", display: "flex"}}>
							<SmallChevronDown style={{width: 10, height: 10, color: "var(--text-faint)", opacity: 0.5}}/>
						</span>
					</span>
					{headerExtra}
				</div>
				<div style={{display: "flex", alignItems: "center", gap: 4}}>
					{isSaving && <Spinner size={10}/>}
					<span style={{fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)", opacity: 0.5}}>
						{entryCountText}
					</span>
					<span style={{fontSize: 10, color: "var(--text-faint)", opacity: 0.4, margin: "0 2px"}}>·</span>
					<span style={{fontSize: 10, color: saveStatusColor, opacity: saveStatusOpacity}}>{saveStatus}</span>
				</div>
			</div>

			{!isCollapsed && <>
				{/* Stats row */}
				{stats && (
					<div style={{
						display: "flex", alignItems: "center", gap: 6,
						padding: "3px 10px",
						borderBottom: "1px solid color-mix(in srgb, var(--background-modifier-border) 50%, transparent)",
					}}>
						<StatPill value={stats.dates} label="dates"/>
						<StatPill value={stats.sentences} label="sentences"/>
						{stats.coverage && <StatPill value={stats.coverage} label="coverage"/>}
					</div>
				)}

				{/* Controls row */}
				<div style={{display: "flex", alignItems: "center", gap: 2, padding: "4px 8px", flexWrap: "wrap"}}>
					{parseButton}

					{DIVIDER}

					{sortButton}

					<span style={toolbarBtn} onClick={onExpandAll ? () => onExpandAll(!allExpanded) : undefined}>
						⊞ {allExpanded ? "Fold all" : "Expand all"}
					</span>

					{hiddenCount > 0 && (
						<span style={toolbarBtn} onClick={onToggleShowHidden}>
							◌ {showHidden ? "Hide hidden" : `Show hidden (${hiddenCount})`}
						</span>
					)}

					{DIVIDER}

					<SigDots value={sigFilter} onChange={onSigFilterChange}/>

					{/* Right side: export · save */}
					<div style={{marginLeft: "auto", display: "flex", gap: 2}}>
						{exportButton}
						<span
							style={{...toolbarIconBtn, color: isDirty ? "var(--text-accent)" : "var(--text-muted)", opacity: isDirty ? 1 : 0.5}}
							onClick={onSave}
							title="Save"
						>
							<SmallSave/>
						</span>
					</div>
				</div>

				{/* Content below toolbar */}
				{children}
			</>}
		</div>
	);
}
