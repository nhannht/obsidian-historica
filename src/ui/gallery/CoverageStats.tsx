import {Section, Row, Tile} from "./helpers";

export function CoverageStats() {
	return (
		<Section id="coverage-stats" title="Coverage Stats">
			<Row gap={16}>
				<Tile label="inline · monospace">
					<div style={{display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "var(--text-faint)", fontFamily: "monospace"}}>
						<span>12 dates</span>
						<span style={{opacity: 0.4}}>·</span>
						<span>47 sentences</span>
						<span style={{opacity: 0.4}}>·</span>
						<span style={{opacity: 0.5}}>25%</span>
					</div>
				</Tile>

				<Tile label="badge row">
					<div style={{display: "flex", gap: 6}}>
						{[{val: "12", label: "dates"}, {val: "47", label: "sentences"}, {val: "25%", label: "coverage"}].map(({val, label}) => (
							<div key={label} style={{
								display: "flex", alignItems: "baseline", gap: 4,
								padding: "2px 7px",
								border: "1px solid var(--background-modifier-border)",
								borderRadius: 3,
							}}>
								<span style={{fontFamily: "monospace", fontSize: 12, color: "var(--text-accent)"}}>{val}</span>
								<span style={{fontSize: 9, color: "var(--text-faint)"}}>{label}</span>
							</div>
						))}
					</div>
				</Tile>

				<Tile label="dispatch label">
					<div style={{display: "flex", gap: 12, alignItems: "center"}}>
						{[{code: "DATES", val: "12"}, {code: "SENTS", val: "47"}, {code: "COV", val: "25%"}].map(({code, val}) => (
							<div key={code} style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 1}}>
								<span style={{fontFamily: "monospace", fontSize: 13, color: "var(--text-accent)"}}>{val}</span>
								<span style={{fontFamily: "monospace", fontSize: 8, color: "var(--text-faint)", letterSpacing: "0.08em"}}>{code}</span>
							</div>
						))}
					</div>
				</Tile>
			</Row>
		</Section>
	);
}
