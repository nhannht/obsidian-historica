import {Section, Row, Tile} from "./helpers";
import {ManualBadge, AnchorBadge} from "../ManualBadge";
import {SourceFilePill} from "../SourceFilePill";
import {EntryCardUI} from "../EntryCardUI";

export function EntryCard() {
	return (
		<Section id="entry-card" title="Timeline Entry Card">
			<Row gap={20} style={{alignItems: "flex-start"}}>
				<Tile label="collapsed">
					<div style={{minWidth: 280}}>
						<EntryCardUI
							expanded={false}
							precisionOpacity={1}
							precisionTitle="Precision: full (year, month, day)"
							chipVariant="normal"
							chipText="March 1492"
							truncatedSentence="Columbus reached the Bahamas on…"
						/>
					</div>
				</Tile>

				<Tile label="expanded · partial · manual · annotation">
					<div style={{minWidth: 300}}>
						<EntryCardUI
							expanded={true}
							precisionOpacity={0.45}
							precisionTitle="Precision: partial (year certain)"
							chipVariant="normal"
							chipText="March 1492"
							badges={<ManualBadge/>}
							sig={3}
							contentSlot={
								<div style={{fontSize: 13, color: "var(--text-normal)", lineHeight: 1.55}}>
									Columbus sailed west from Palos de la Frontera, reaching the Bahamas in October of that year.
								</div>
							}
							hasAnnotation={true}
							annotationSlot={
								<div style={{fontSize: 12, color: "var(--text-muted)"}}>Key turning point in European expansion westward.</div>
							}
							sourceFilePill={<SourceFilePill path="notes/Columbus.md"/>}
						/>
					</div>
				</Tile>

				<Tile label="approximate · anchor">
					<div style={{minWidth: 240}}>
						<EntryCardUI
							expanded={true}
							isApproximate={true}
							precisionOpacity={0.12}
							precisionTitle="Precision: approximate (year inferred)"
							chipVariant="approximate"
							chipText="~1490s"
							badges={<AnchorBadge/>}
							sig={4}
							contentSlot={
								<div style={{fontSize: 13, color: "var(--text-normal)", lineHeight: 1.55}}>
									The late 15th century saw rapid expansion of European maritime exploration.
								</div>
							}
							sourceFilePill={<SourceFilePill path="anchors/Age-of-Discovery.md"/>}
						/>
					</div>
				</Tile>
			</Row>
		</Section>
	);
}
