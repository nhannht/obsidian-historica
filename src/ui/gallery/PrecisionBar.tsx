import {Section, Row, Tile} from "./helpers";
import {PrecisionGutter} from "../PrecisionGutter";
import {DateChip} from "../DateChip";

export function PrecisionBar() {
	const levels: Array<{label: string; opacity: number; variant: "normal" | "approximate"}> = [
		{label: "full — year · month · day", opacity: 1.0,  variant: "normal"},
		{label: "partial — year certain",    opacity: 0.45, variant: "normal"},
		{label: "approximate — inferred",    opacity: 0.15, variant: "approximate"},
	];
	return (
		<Section id="precision-bar" title="Precision Bar">
			<Row gap={12}>
				<Tile label="left gutter · solid bar">
					<div style={{display: "flex", flexDirection: "column", gap: 10}}>
						{levels.map(({label, opacity}) => (
							<div key={label} style={{position: "relative", paddingLeft: 10, display: "flex", alignItems: "center", gap: 10}}>
								<PrecisionGutter opacity={opacity}/>
								<DateChip variant="normal">March 1492</DateChip>
								<span style={{fontSize: 10, color: "var(--text-faint)"}}>{label}</span>
							</div>
						))}
					</div>
				</Tile>

				<Tile label="chip · precision variants">
					<div style={{display: "flex", flexDirection: "column", gap: 10}}>
						{levels.map(({label, opacity, variant}) => (
							<div key={label} style={{display: "flex", alignItems: "center", gap: 10}}>
								<span style={{opacity}}>
									<DateChip variant={variant}>{variant === "approximate" ? "~1490s" : "March 1492"}</DateChip>
								</span>
								<span style={{fontSize: 10, color: "var(--text-faint)"}}>{label}</span>
							</div>
						))}
					</div>
				</Tile>
			</Row>
		</Section>
	);
}
