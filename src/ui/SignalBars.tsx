import {SIG_LEVELS} from "./constants";

export function SignalBars({sig, onBarClick}: {sig: number; onBarClick?: (level: number) => void}) {
	return (
		<div style={{display: "flex", alignItems: "center", gap: 6}}>
			<span style={{fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)", minWidth: 8, textAlign: "right"}}>
				{sig}
			</span>
			<input
				type="range"
				min={1}
				max={SIG_LEVELS.length}
				step={1}
				value={sig}
				onChange={onBarClick ? e => onBarClick(Number(e.target.value)) : undefined}
				readOnly={!onBarClick}
				title={`Significance ${sig}/${SIG_LEVELS.length}`}
				style={{
					width: 80,
					height: 4,
					cursor: onBarClick ? "pointer" : "default",
					accentColor: "var(--interactive-accent)",
				}}
			/>
			<span style={{fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)"}}>{SIG_LEVELS.length}</span>
		</div>
	);
}
