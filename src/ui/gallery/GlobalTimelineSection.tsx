import {motion} from "motion/react";
import {DUR} from "../animTokens";
import {Section, Row, Tile} from "./helpers";
import {PILL_RADIUS} from "./constants";
import {RugHeat} from "../RugHeat";

export function GlobalTimelineSection() {
	const rugYears = [1066, 1075, 1087, 1154, 1170, 1215, 1265, 1284, 1337, 1348, 1381, 1415, 1455, 1485, 1492, 1509, 1517, 1534, 1558, 1588];

	const entries = [
		{date: "Oct 14, 1066",  sentence: "William defeats Harold at the Battle of Hastings.", note: "Battle of Hastings.md"},
		{date: "Jun 15, 1215",  sentence: "King John seals the Magna Carta at Runnymede.",     note: "Magna Carta.md"},
		{date: "~1348",          sentence: "The Black Death reaches England from mainland Europe.", note: "Black Death.md"},
		{date: "Oct 12, 1492",  sentence: "Columbus makes landfall in the Caribbean.",           note: "Columbus Voyage.md"},
		{date: "Oct 31, 1517",  sentence: "Martin Luther posts his 95 Theses in Wittenberg.",   note: "Reformation.md"},
	];
	return (
		<Section id="global-timeline" title="Global Timeline">
			<Row gap={24} style={{alignItems: "flex-start"}}>

				<Tile label="E1 · balanced · tick 10 stripe 5">
					<RugHeat years={rugYears} min={1066} max={1600} width={320} tickH={10} stripeH={5}/>
				</Tile>

				<Tile label="E2 · tall ticks · tick 18 stripe 4">
					<RugHeat years={rugYears} min={1066} max={1600} width={320} tickH={18} stripeH={4}/>
				</Tile>

				<Tile label="E3 · stripe-forward · tick 6 stripe 10">
					<RugHeat years={rugYears} min={1066} max={1600} width={320} tickH={6} stripeH={10}/>
				</Tile>

			</Row>

			<div style={{marginTop: 16}}>
				<div style={{fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)", marginBottom: 8, letterSpacing: "0.06em"}}>full layout · E1 in context</div>
				<div style={{
					border: "1px solid var(--background-modifier-border)",
					borderRadius: 5, width: 480, overflow: "hidden",
					display: "flex", flexDirection: "column",
				}}>
					<div style={{borderBottom: "1px solid var(--background-modifier-border)", padding: "6px 12px 8px"}}>
						<div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 8}}>
							<span style={{display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-muted)", cursor: "pointer"}}>
								<span>▸</span> Filter
							</span>
							<span style={{
								display: "inline-flex", alignItems: "center", gap: 4,
								fontSize: 10, padding: "1px 7px",
								background: "color-mix(in srgb, var(--interactive-accent) 10%, transparent)",
								border: "1px solid color-mix(in srgb, var(--interactive-accent) 30%, transparent)",
								borderRadius: PILL_RADIUS, color: "var(--text-accent)",
							}}>
								1066 – 1600 <span style={{opacity: 0.5, cursor: "pointer"}}>×</span>
							</span>
							<span style={{marginLeft: "auto", fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)"}}>20 entries</span>
						</div>
						<RugHeat years={rugYears} min={1066} max={1600} width={456} tickH={10} stripeH={5}/>
					</div>
					{entries.map(({date, sentence, note}, i) => (
						<motion.div
							key={date}
							initial={{opacity: 0, y: 2}}
							animate={{opacity: 1, y: 0}}
							transition={{duration: DUR.reveal, delay: i < 8 ? i * 0.02 : 0}}
							style={{
								display: "flex", gap: 12, padding: "8px 12px",
								borderBottom: "1px solid color-mix(in srgb, var(--background-modifier-border) 30%, transparent)",
							}}
						>
							<span style={{fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)", minWidth: 96, flexShrink: 0, paddingTop: 1}}>{date}</span>
							<div style={{flex: 1, minWidth: 0}}>
								<div style={{fontSize: 13, color: "var(--text-normal)", lineHeight: 1.4, marginBottom: 3}}>{sentence}</div>
								<span style={{fontSize: 11, color: "var(--text-accent)", opacity: 0.8}}>{note}</span>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</Section>
	);
}
