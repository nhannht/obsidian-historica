import {Section, Row, Tile} from "./helpers";
import {StatPill} from "../StatPill";

export function CoverageStats() {
	return (
		<Section id="coverage-stats" title="Coverage Stats">
			<Row gap={16}>
				<Tile label="StatPill · inline row">
					<div style={{display: "flex", alignItems: "center", gap: 6}}>
						<StatPill value={12} label="dates"/>
						<StatPill value={47} label="sentences"/>
						<StatPill value="25%" label="coverage"/>
					</div>
				</Tile>
			</Row>
		</Section>
	);
}
