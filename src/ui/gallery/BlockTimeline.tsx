import {Section, Row, Tile} from "./helpers";
import {PrecisionGutter} from "../PrecisionGutter";
import {SignalBars} from "../SignalBars";

export function BlockTimeline() {
	const entries = [
		{date: "Oct 1492",  sentence: "Columbus reaches the Bahamas, first landfall in the Americas.", precision: 1.0,  sig: 5},
		{date: "Aug 1492",  sentence: "The fleet departs from Palos de la Frontera with three ships.",  precision: 1.0,  sig: 3},
		{date: "~1490s",    sentence: "Negotiations with the Spanish crown take several years.",         precision: 0.15, sig: null},
		{date: "Apr 1493",  sentence: "Return to Spain; Columbus presents his findings to the monarchs.", precision: 0.45, sig: 2},
	];
	return (
		<Section id="block-timeline" title="Block Timeline (Full)">
			<Row gap={24} style={{alignItems: "flex-start"}}>

				<Tile label="block · with toolbar + entries">
					<div style={{
						border: "1px solid var(--background-modifier-border)",
						borderRadius: 5, width: 420, overflow: "hidden",
					}}>
						<div style={{borderBottom: "1px solid var(--background-modifier-border)"}}>
							<div style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 10px"}}>
								<span style={{fontSize: 12, fontWeight: 600, color: "var(--text-normal)"}}>Historica</span>
								<span style={{fontSize: 10, color: "var(--text-muted)", opacity: 0.6}}>4 entries · Saved</span>
							</div>
							<div style={{display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", borderTop: "1px solid color-mix(in srgb, var(--background-modifier-border) 40%, transparent)"}}>
								<span style={{fontFamily: "monospace", fontSize: 10, color: "var(--text-faint)"}}>4 dates · 18 sentences · 22%</span>
							</div>
						</div>
						{entries.map(({date, sentence, precision, sig}) => (
							<div key={date} style={{
								position: "relative", paddingLeft: 10,
								borderBottom: "1px solid color-mix(in srgb, var(--background-modifier-border) 30%, transparent)",
							}}>
								<PrecisionGutter opacity={precision} radius={0}/>
								<div style={{display: "flex", alignItems: "center", gap: 8, padding: "6px 8px"}}>
									<span style={{
										fontFamily: "monospace", fontSize: 10,
										color: "var(--text-accent)",
										background: "color-mix(in srgb, var(--interactive-accent) 10%, transparent)",
										padding: "1px 5px", borderRadius: 2, flexShrink: 0,
									}}>{date}</span>
									<span style={{fontSize: 12, color: "var(--text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{sentence}</span>
									{sig !== null && <SignalBars sig={sig} size="sm"/>}
									<svg style={{width: 10, height: 10, opacity: 0.3, flexShrink: 0}} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2L8 6L4 10"/></svg>
								</div>
							</div>
						))}
						<div style={{
							display: "flex", alignItems: "center", gap: 6,
							padding: "5px 10px",
							borderTop: "1px solid var(--background-modifier-border)",
						}}>
							<svg style={{width: 10, height: 10, color: "var(--text-faint)", flexShrink: 0}} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2L8 6L4 10"/></svg>
							<span style={{fontSize: 11, color: "var(--text-muted)", fontWeight: 500}}>3 unmatched sentences</span>
							<span style={{fontSize: 10, color: "var(--text-faint)", opacity: 0.6}}>— no date found</span>
						</div>
					</div>
				</Tile>

				<Tile label="block · empty state">
					<div style={{
						border: "1px solid var(--background-modifier-border)",
						borderRadius: 5, width: 300, overflow: "hidden",
					}}>
						<div style={{borderBottom: "1px solid var(--background-modifier-border)", padding: "5px 10px"}}>
							<span style={{fontSize: 12, fontWeight: 600, color: "var(--text-normal)"}}>Historica</span>
						</div>
						<div style={{padding: "32px 16px", textAlign: "center"}}>
							<div style={{fontSize: 13, color: "var(--text-faint)", marginBottom: 8}}>No dates found in this note yet</div>
							<div style={{fontSize: 11, color: "var(--text-faint)", opacity: 0.7, lineHeight: 1.5}}>
								Historica reads your existing prose and extracts every date it finds.
							</div>
							<span style={{
								display: "inline-block",
								marginTop: 14, fontSize: 11, fontFamily: "monospace",
								color: "var(--text-accent)",
								border: "1px solid color-mix(in srgb, var(--interactive-accent) 40%, transparent)",
								padding: "4px 12px", borderRadius: 3, cursor: "pointer",
							}}>Parse this file</span>
						</div>
					</div>
				</Tile>

			</Row>
		</Section>
	);
}
