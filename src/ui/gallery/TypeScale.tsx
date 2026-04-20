import {Section} from "./helpers";
import {DateChip} from "../DateChip";
import {SectionLabel} from "../SectionLabel";

export function TypeScale() {
	return (
		<Section id="type-scale" title="Type Scale">
			<div style={{
				background: "var(--background-secondary)",
				border: "1px solid var(--background-modifier-border)",
				borderRadius: 5, padding: 20,
				display: "flex", flexDirection: "column", gap: 16,
			}}>
				<div style={{display: "flex", alignItems: "baseline", gap: 24}}>
					<span style={{fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)", minWidth: 60}}>9px mono</span>
					<SectionLabel>SOURCE · MANUAL · ~3Y GAP</SectionLabel>
				</div>
				<div style={{display: "flex", alignItems: "baseline", gap: 24}}>
					<span style={{fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)", minWidth: 60}}>10px sc</span>
					<span style={{fontSize: 10, fontVariant: "small-caps", letterSpacing: "0.08em", color: "var(--text-faint)"}}>annotation · source · precision</span>
				</div>
				<div style={{display: "flex", alignItems: "baseline", gap: 24}}>
					<span style={{fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)", minWidth: 60}}>11px mono</span>
					<DateChip variant="normal">March 1492</DateChip>
					<DateChip variant="approximate">~1490s</DateChip>
				</div>
				<div style={{display: "flex", alignItems: "baseline", gap: 24}}>
					<span style={{fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)", minWidth: 60}}>12px ui</span>
					<span style={{fontSize: 12, color: "var(--text-muted)"}}>notes/Columbus Voyage.md · file path · timestamps</span>
				</div>
				<div style={{display: "flex", alignItems: "baseline", gap: 24}}>
					<span style={{fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)", minWidth: 60}}>13px body</span>
					<span style={{fontSize: 13, color: "var(--text-normal)", lineHeight: 1.55}}>
						Columbus sailed west from Palos de la Frontera, reaching the Bahamas in October.
					</span>
				</div>
				<div style={{display: "flex", alignItems: "baseline", gap: 24}}>
					<span style={{fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)", minWidth: 60}}>serif</span>
					<span style={{fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 14, color: "var(--text-normal)", lineHeight: 1.6, opacity: 0.8}}>
						Columbus sailed west from Palos de la Frontera, reaching the Bahamas in October.
					</span>
				</div>
			</div>
		</Section>
	);
}
