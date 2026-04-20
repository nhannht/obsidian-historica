import {Section, Row, Tile} from "./helpers";
import {ManualBadge, AnchorBadge, FileExtBadge} from "../ManualBadge";
import {SourceFilePill} from "../SourceFilePill";

export function BadgeSection() {
	return (
		<Section id="badge" title="Badge">
			<Row gap={12}>
				<Tile label="stamp · manual">
					<ManualBadge/>
				</Tile>

				<Tile label="stamp · anchor ref">
					<AnchorBadge title="Cross-vault anchor reference"/>
				</Tile>

				<Tile label="file extension">
					<div style={{display: "flex", gap: 6}}>
						<FileExtBadge ext="png"/>
						<FileExtBadge ext="md"/>
						<FileExtBadge ext="pdf"/>
					</div>
				</Tile>

				<Tile label="source file pill">
					<SourceFilePill path="notes/Columbus Voyage.md"/>
				</Tile>
			</Row>
		</Section>
	);
}
