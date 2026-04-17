import {Section, Row, Tile} from "./helpers";
import {PrecisionGutter} from "../PrecisionGutter";

export function EntryCard() {
	return (
		<Section id="entry-card" title="Timeline Entry Card">
			<Row gap={20} style={{alignItems: "flex-start"}}>
				<Tile label="collapsed">
					<div style={{position: "relative", paddingLeft: 10, minWidth: 280}}>
						<PrecisionGutter opacity={1}/>
						<div style={{display: "flex", alignItems: "center", gap: 8}}>
							<span style={{
								fontFamily: "monospace", fontSize: 11,
								color: "var(--text-accent)",
								background: "color-mix(in srgb, var(--interactive-accent) 10%, transparent)",
								padding: "2px 6px", borderRadius: 3,
							}}>March 1492</span>
							<span style={{fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1}}>
								Columbus reached the Bahamas on…
							</span>
							<svg style={{width: 12, height: 12, opacity: 0.35, flexShrink: 0}} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2L8 6L4 10"/></svg>
						</div>
					</div>
				</Tile>

				<Tile label="expanded · partial · manual · annotation">
					<div style={{position: "relative", paddingLeft: 10, minWidth: 300}}>
						<PrecisionGutter opacity={0.45}/>
						<div style={{
							border: "1px solid var(--background-modifier-border)",
							background: "var(--background-primary)",
							borderRadius: 5, padding: "10px 12px",
						}}>
							<div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 8}}>
								<span style={{
									fontFamily: "monospace", fontSize: 11,
									color: "var(--text-accent)",
									background: "color-mix(in srgb, var(--interactive-accent) 10%, transparent)",
									padding: "2px 6px", borderRadius: 3,
								}}>March 1492</span>
								<span style={{
									fontSize: 9, fontFamily: "monospace",
									color: "var(--text-faint)", opacity: 0.65,
									border: "2px solid var(--text-faint)",
									padding: "1px 5px",
									textTransform: "uppercase", letterSpacing: "0.1em",
								}}>manual</span>
							</div>
							<div style={{fontSize: 13, color: "var(--text-normal)", lineHeight: 1.55}}>
								Columbus sailed west from Palos de la Frontera, reaching the Bahamas in October of that year.
							</div>
							<div style={{marginTop: 10, borderLeft: "2px solid rgba(251,191,36,0.45)", paddingLeft: 10}}>
								<span style={{fontSize: 10, fontVariant: "small-caps", color: "var(--text-faint)", letterSpacing: "0.04em", display: "block", marginBottom: 2}}>annotation</span>
								<div style={{fontSize: 12, fontStyle: "italic", color: "var(--text-muted)"}}>Key turning point in European expansion westward.</div>
							</div>
						</div>
					</div>
				</Tile>

				<Tile label="approximate · anchor">
					<div style={{position: "relative", paddingLeft: 10, minWidth: 240}}>
						<PrecisionGutter opacity={0.12}/>
						<div style={{
							border: "1px dashed var(--background-modifier-border)",
							borderRadius: 5, padding: "8px 12px",
						}}>
							<div style={{marginBottom: 6}}>
								<span style={{
									fontFamily: "monospace", fontSize: 11,
									color: "var(--text-faint)", opacity: 0.6,
									border: "1px dashed color-mix(in srgb, var(--text-faint) 40%, transparent)",
									padding: "2px 6px", borderRadius: 3,
								}}>~1490s</span>
							</div>
							<div style={{fontSize: 13, color: "var(--text-normal)", lineHeight: 1.55, opacity: 0.6}}>
								The late 15th century saw rapid expansion of European maritime exploration.
							</div>
						</div>
					</div>
				</Tile>
			</Row>
		</Section>
	);
}
