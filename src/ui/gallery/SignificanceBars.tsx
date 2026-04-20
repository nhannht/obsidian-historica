import {Section, Row, Tile} from "./helpers";
import {SIG_LEVELS} from "./constants";
import {SignalBars} from "../SignalBars";

export function SignificanceBars() {
	const states: Array<{label: string; sig: number | null}> = [
		{label: "unset", sig: null},
		{label: "1 / 5",  sig: 1},
		{label: "3 / 5",  sig: 3},
		{label: "5 / 5",  sig: 5},
	];
	return (
		<Section id="significance-bars" title="Significance Bars">
			<Row gap={12}>
				<Tile label="signal bars + state dot">
					<Row gap={20} style={{alignItems: "flex-end"}}>
						{states.map(({label, sig}) => (
							<div key={label} style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 6}}>
								{sig === null ? (
									<div style={{
										fontSize: 10, color: "var(--text-faint)", opacity: 0.5,
										padding: "2px 6px", border: "1px dashed color-mix(in srgb, var(--text-faint) 40%, transparent)",
										borderRadius: 3, fontFamily: "monospace",
									}}>—</div>
								) : (
									<div style={{display: "flex", alignItems: "flex-end", gap: 3}}>
										<span style={{
											width: 5, height: 5, borderRadius: "50%",
											background: "var(--interactive-accent)", opacity: 0.75,
											flexShrink: 0, marginRight: 2, marginBottom: 1,
										}}/>
										<SignalBars sig={sig}/>
									</div>
								)}
								<span style={{fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)"}}>{label}</span>
							</div>
						))}
					</Row>
				</Tile>

				<Tile label="roman numerals">
					{["—", "I", "II", "III", "IV", "V"].map((n, i) => (
						<span key={n} style={{
							display: "inline-block", marginRight: 8,
							fontFamily: "Georgia, serif", fontSize: 13,
							color: i === 0 ? "var(--text-faint)" : "var(--text-accent)",
							opacity: i === 0 ? 0.4 : i / 5,
						}}>{n}</span>
					))}
				</Tile>

				<Tile label="filled pips">
					<Row gap={16} style={{alignItems: "center"}}>
						{[null, 2, 4].map((sig, si) => (
							<div key={si} style={{display: "flex", gap: 4}}>
								{sig === null
									? <span style={{fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)", opacity: 0.4}}>○ ○ ○ ○ ○</span>
									: SIG_LEVELS.map(n => (
										<div key={n} style={{
											width: 8, height: 8, borderRadius: "50%",
											background: n <= sig ? "var(--interactive-accent)" : "transparent",
											border: `1.5px solid ${n <= sig ? "var(--interactive-accent)" : "color-mix(in srgb, var(--text-faint) 35%, transparent)"}`,
											opacity: n <= sig ? 1 : 0.4,
										}}/>
									))
								}
							</div>
						))}
					</Row>
				</Tile>
			</Row>
		</Section>
	);
}
