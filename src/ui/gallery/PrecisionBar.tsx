import {Section, Row, Tile} from "./helpers";
import {PrecisionGutter} from "../PrecisionGutter";

export function PrecisionBar() {
	const levels = [
		{label: "full — year · month · day", opacity: 1.0},
		{label: "partial — year certain",    opacity: 0.45},
		{label: "approximate — inferred",    opacity: 0.15},
	];
	return (
		<Section id="precision-bar" title="Precision Bar">
			<Row gap={12}>
				<Tile label="left gutter · solid bar">
					<div style={{display: "flex", flexDirection: "column", gap: 10}}>
						{levels.map(({label, opacity}) => (
							<div key={label} style={{position: "relative", paddingLeft: 10, display: "flex", alignItems: "center", gap: 10}}>
								<PrecisionGutter opacity={opacity}/>
								<span style={{fontFamily: "monospace", fontSize: 11, color: "var(--text-accent)"}}>March 1492</span>
								<span style={{fontSize: 10, color: "var(--text-faint)"}}>{label}</span>
							</div>
						))}
					</div>
				</Tile>

				<Tile label="left gutter · dashed at approximate">
					<div style={{display: "flex", flexDirection: "column", gap: 10}}>
						{levels.map(({label, opacity}, i) => (
							<div key={label} style={{position: "relative", paddingLeft: 10, display: "flex", alignItems: "center", gap: 10}}>
								<div style={{
									position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
									background: i === 2 ? "transparent" : "var(--interactive-accent)",
									borderLeft: i === 2 ? "2px dashed color-mix(in srgb, var(--interactive-accent) 40%, transparent)" : "none",
									opacity, borderRadius: i < 2 ? 2 : 0,
								}}/>
								<span style={{fontFamily: "monospace", fontSize: 11, color: "var(--text-accent)"}}>March 1492</span>
								<span style={{fontSize: 10, color: "var(--text-faint)"}}>{label}</span>
							</div>
						))}
					</div>
				</Tile>

				<Tile label="chip opacity">
					<div style={{display: "flex", flexDirection: "column", gap: 10}}>
						{levels.map(({label, opacity}) => (
							<div key={label} style={{display: "flex", alignItems: "center", gap: 10}}>
								<span style={{
									fontFamily: "monospace", fontSize: 11,
									color: "var(--text-accent)",
									background: "color-mix(in srgb, var(--interactive-accent) 10%, transparent)",
									padding: "2px 7px", borderRadius: 3,
									opacity,
								}}>March 1492</span>
								<span style={{fontSize: 10, color: "var(--text-faint)"}}>{label}</span>
							</div>
						))}
					</div>
				</Tile>
			</Row>
		</Section>
	);
}
