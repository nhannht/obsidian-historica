import {Section, Row, Tile} from "./helpers";
import {ChevronRight} from "../icons";

export function UnparsedPanel() {
	const sentences = [
		"The expedition was planned for several years before the voyage.",
		"Many sailors were reluctant to join the crew.",
		"The return journey proved equally challenging for all involved.",
	];
	return (
		<Section id="unparsed-panel" title="Unparsed Panel">
			<Row gap={24} style={{alignItems: "flex-start"}}>

				<Tile label="wire dispatch · numbered">
					<div style={{width: 360}}>
						<div style={{
							display: "flex", alignItems: "baseline", gap: 8,
							paddingBottom: 10, marginBottom: 2,
							borderBottom: "2px solid var(--background-modifier-border)",
						}}>
							<span style={{fontFamily: "monospace", fontSize: 8, letterSpacing: "0.12em", color: "var(--text-faint)", opacity: 0.55}}>UNDATED</span>
							<span style={{fontFamily: "monospace", fontSize: 16, color: "var(--text-accent)", lineHeight: 1}}>3</span>
							<span style={{fontSize: 11, color: "var(--text-faint)"}}>fragments without timestamp</span>
						</div>
						{sentences.map((s, i) => (
							<div key={i} style={{
								display: "flex", gap: 12, padding: "10px 0",
								borderBottom: i < sentences.length - 1
									? "1px solid color-mix(in srgb, var(--background-modifier-border) 35%, transparent)"
									: "none",
							}}>
								<span style={{
									fontFamily: "monospace", fontSize: 9, color: "var(--text-faint)",
									opacity: 0.35, minWidth: 18, paddingTop: 2, userSelect: "none",
								}}>{String(i + 1).padStart(2, "0")}</span>
								<div style={{flex: 1}}>
									<div style={{fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 5}}>{s}</div>
									<span style={{
										fontSize: 10, fontFamily: "monospace",
										color: "var(--text-faint)", letterSpacing: "0.04em",
										opacity: 0.5, cursor: "pointer",
									}}>TAG →</span>
								</div>
							</div>
						))}
					</div>
				</Tile>

				<Tile label="evidence · left-border fragments">
					<div style={{width: 340}}>
						<div style={{
							fontSize: 10, fontVariant: "small-caps", letterSpacing: "0.08em",
							color: "var(--text-faint)", marginBottom: 10,
							display: "flex", gap: 8, alignItems: "center",
						}}>
							<span style={{fontFamily: "monospace", fontSize: 13, color: "var(--text-accent)"}}>3</span>
							unmatched sentences
						</div>
						{sentences.map((s, i) => (
							<div key={i} style={{
								padding: "8px 10px", marginBottom: 6,
								background: "color-mix(in srgb, var(--background-modifier-border) 18%, transparent)",
								borderLeft: "2px solid color-mix(in srgb, var(--background-modifier-border) 60%, transparent)",
								borderRadius: "0 3px 3px 0",
							}}>
								<div style={{fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 6}}>{s}</div>
								<div style={{display: "flex", alignItems: "center", gap: 8}}>
									<span style={{
										fontFamily: "monospace", fontSize: 9, letterSpacing: "0.08em",
										color: "var(--text-faint)", opacity: 0.45,
									}}>[DATE?]</span>
									<div style={{
										flex: 1, height: 1,
										background: "color-mix(in srgb, var(--background-modifier-border) 55%, transparent)",
									}}/>
									<span style={{
										fontSize: 10, fontFamily: "monospace",
										color: "var(--text-faint)", opacity: 0.45, letterSpacing: "0.04em",
										cursor: "pointer",
									}}>assign →</span>
								</div>
							</div>
						))}
					</div>
				</Tile>

				<Tile label="ghost list · open circles">
					<div style={{width: 320}}>
						<div style={{
							display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
						}}>
							<ChevronRight style={{width: 10, height: 10, flexShrink: 0, color: "var(--text-faint)", transform: "rotate(90deg)"}}/>
							<span style={{fontSize: 11, color: "var(--text-muted)", fontWeight: 500}}>
								3 sentences —{" "}
								<span style={{fontWeight: 400, color: "var(--text-faint)"}}>no date extracted</span>
							</span>
						</div>
						{sentences.map((s, i) => (
							<div key={i} style={{
								display: "flex", alignItems: "flex-start", gap: 10,
								padding: "7px 0",
								borderTop: i > 0 ? "1px dashed color-mix(in srgb, var(--background-modifier-border) 50%, transparent)" : "none",
							}}>
								<span style={{
									marginTop: 4, width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
									border: "1.5px solid color-mix(in srgb, var(--text-faint) 40%, transparent)",
									display: "inline-block",
								}}/>
								<div style={{flex: 1}}>
									<div style={{fontSize: 12, color: "var(--text-faint)", lineHeight: 1.5, marginBottom: 4, opacity: 0.7}}>{s}</div>
									<span style={{
										fontSize: 10, fontFamily: "monospace",
										color: "var(--interactive-accent)", opacity: 0.6,
										letterSpacing: "0.03em", cursor: "pointer",
									}}>+ tag date</span>
								</div>
							</div>
						))}
					</div>
				</Tile>

			</Row>
		</Section>
	);
}
