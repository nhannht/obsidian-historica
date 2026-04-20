import {Section, Row, Tile} from "./helpers";
import {Spinner} from "../Spinner";
import {InlineLoadingState} from "../InlineLoadingState";
import {ParsingOverlay} from "../ParsingOverlay";
import {StatusBanner} from "../StatusBanner";
import {ErrorState} from "../ErrorState";

export function LoadingStates() {
	return (
		<Section id="loading-states" title="Loading States">
			<Row gap={16} style={{alignItems: "flex-start"}}>

				<Tile label="spinner · standalone">
					<div style={{display: "flex", alignItems: "center", gap: 12}}>
						<Spinner size={14}/>
						<Spinner size={18}/>
						<Spinner size={24}/>
					</div>
				</Tile>

				<Tile label="InlineLoadingState">
					<div style={{
						border: "1px solid var(--background-modifier-border)",
						borderRadius: 5, width: 260, padding: "16px 12px",
					}}>
						<InlineLoadingState message="Loading timeline\u2026"/>
					</div>
				</Tile>

				<Tile label="ParsingOverlay">
					<div style={{
						position: "relative",
						border: "1px solid var(--background-modifier-border)",
						borderRadius: 5, width: 260, height: 80,
					}}>
						<ParsingOverlay visible={true}/>
					</div>
				</Tile>

				<Tile label="ErrorState">
					<div style={{
						border: "1px solid var(--background-modifier-border)",
						borderRadius: 5, width: 260,
					}}>
						<ErrorState message="Failed to load timeline data"/>
					</div>
				</Tile>

				<Tile label="StatusBanner · variants">
					<div style={{display: "flex", flexDirection: "column", gap: 6, width: 320}}>
						<StatusBanner icon="⚠" message="Parser version changed — re-parse to update" variant="warning"/>
						<StatusBanner icon="↻" message="Source changed since last extraction" variant="info"/>
						<StatusBanner message="Unsaved changes" variant="muted"/>
					</div>
				</Tile>

			</Row>
		</Section>
	);
}
