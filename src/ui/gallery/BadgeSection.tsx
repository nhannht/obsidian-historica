import {Section, Row, Tile} from "./helpers";
import {PILL_RADIUS} from "./constants";

export function BadgeSection() {
	return (
		<Section id="badge" title="Badge">
			<Row gap={12}>
				<Tile label="pill · outline">
					<span style={{
						fontSize: 11, padding: "2px 8px", borderRadius: PILL_RADIUS,
						border: "1px solid var(--background-modifier-border)",
						color: "var(--text-muted)",
					}}>notes/Voyage.md</span>
				</Tile>

				<Tile label="stamp · mono uppercase">
					<span style={{
						fontSize: 9, padding: "1px 6px",
						border: "2px solid var(--text-faint)",
						color: "var(--text-faint)", opacity: 0.65,
						textTransform: "uppercase", letterSpacing: "0.12em",
						fontFamily: "monospace",
					}}>manual</span>
				</Tile>

				<Tile label="bracket · mono">
					<span style={{fontFamily: "monospace", fontSize: 11, color: "var(--text-faint)", opacity: 0.7}}>[manual]</span>
				</Tile>

				<Tile label="dot + label">
					<span style={{display: "flex", alignItems: "center", gap: 5}}>
						<span style={{
							width: 6, height: 6, borderRadius: "50%",
							background: "var(--interactive-accent)", opacity: 0.6,
							display: "inline-block", flexShrink: 0,
						}}/>
						<span style={{fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)"}}>manual</span>
					</span>
				</Tile>

				<Tile label="ink blot · filled">
					<span style={{
						fontSize: 9, padding: "2px 7px",
						background: "color-mix(in srgb, var(--text-faint) 15%, transparent)",
						color: "var(--text-faint)",
						fontFamily: "monospace", letterSpacing: "0.06em",
						borderRadius: 2,
					}}>manual</span>
				</Tile>
			</Row>
		</Section>
	);
}
