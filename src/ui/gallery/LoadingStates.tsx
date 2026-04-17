import {Section, Row, Tile} from "./helpers";
import {BOUNCE_DELAYS} from "./constants";
import {Spinner} from "../Spinner";

export function LoadingStates() {
	return (
		<Section id="loading-states" title="Loading States">
			<Row gap={16} style={{alignItems: "flex-start"}}>

				<Tile label="spinner · candidates">
					<div style={{display: "flex", flexDirection: "column", gap: 14}}>
						<div style={{display: "flex", alignItems: "center", gap: 8}}>
							<Spinner size={14}/>
							<span style={{fontSize: 12, color: "var(--text-muted)"}}>arc spinner</span>
						</div>
						<div style={{display: "flex", alignItems: "center", gap: 8}}>
							<span style={{
								display: "inline-block", width: 8, height: 8, borderRadius: "50%",
								background: "var(--interactive-accent)",
								animation: "historica-pulse 1.2s ease-in-out infinite",
							}}/>
							<span style={{fontSize: 12, color: "var(--text-muted)"}}>pulse dot</span>
						</div>
						<div style={{display: "flex", alignItems: "center", gap: 8}}>
							<span style={{display: "flex", gap: 3, alignItems: "center"}}>
								{BOUNCE_DELAYS.map((delay, i) => (
									<span key={i} style={{
										display: "inline-block", width: 5, height: 5, borderRadius: "50%",
										background: "var(--interactive-accent)",
										animation: `historica-bounce 1s ease-in-out ${delay}s infinite`,
									}}/>
								))}
							</span>
							<span style={{fontSize: 12, color: "var(--text-muted)"}}>bounce dots</span>
						</div>
						<div style={{display: "flex", flexDirection: "column", gap: 4}}>
							<div style={{height: 2, width: 120, background: "color-mix(in srgb, var(--interactive-accent) 15%, transparent)", borderRadius: 1, overflow: "hidden", position: "relative"}}>
								<div style={{
									position: "absolute", top: 0, left: 0, height: "100%", width: "40%",
									background: "var(--interactive-accent)", borderRadius: 1,
									animation: "historica-sweep 1.4s ease-in-out infinite",
								}}/>
							</div>
							<span style={{fontSize: 12, color: "var(--text-muted)"}}>sweep bar</span>
						</div>
					</div>
				</Tile>

				<Tile label="loading · block inline">
					<div style={{
						padding: "16px 12px",
						border: "1px solid var(--background-modifier-border)",
						borderRadius: 5, width: 260,
					}}>
						<div style={{display: "flex", alignItems: "center", gap: 8}}>
							<Spinner size={13}/>
							<span style={{fontSize: 12, color: "var(--text-muted)"}}>Loading timeline…</span>
						</div>
					</div>
				</Tile>

				<Tile label="parsing · overlay">
					<div style={{
						border: "1px solid var(--background-modifier-border)",
						borderRadius: 5, width: 260, overflow: "hidden",
					}}>
						{[0.6, 0.4, 0.5].map((op, i) => (
							<div key={i} style={{
								display: "flex", alignItems: "center", gap: 8,
								padding: "6px 10px",
								borderBottom: "1px solid color-mix(in srgb, var(--background-modifier-border) 30%, transparent)",
								opacity: op * 0.4,
							}}>
								<div style={{width: 56, height: 10, borderRadius: 3, background: "var(--background-modifier-border)"}}/>
								<div style={{flex: 1, height: 10, borderRadius: 3, background: "var(--background-modifier-border)"}}/>
							</div>
						))}
						<div style={{
							display: "flex", alignItems: "center", gap: 6,
							padding: "6px 10px",
							background: "color-mix(in srgb, var(--interactive-accent) 6%, transparent)",
							borderTop: "1px solid color-mix(in srgb, var(--interactive-accent) 20%, transparent)",
						}}>
							<Spinner size={11}/>
							<span style={{fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)"}}>Parsing…</span>
						</div>
					</div>
				</Tile>

				<Tile label="status banners">
					<div style={{display: "flex", flexDirection: "column", gap: 6, width: 280}}>
						{[
							{bg: "color-mix(in srgb, var(--interactive-accent) 8%, transparent)", border: "color-mix(in srgb, var(--interactive-accent) 25%, transparent)", text: "Parser version changed — re-parse to update", icon: "⚠"},
							{bg: "color-mix(in srgb, orange 6%, transparent)",                    border: "color-mix(in srgb, orange 25%, transparent)",                    text: "Source changed since last extraction",        icon: "↻"},
							{bg: "color-mix(in srgb, var(--interactive-accent) 5%, transparent)", border: "color-mix(in srgb, var(--interactive-accent) 15%, transparent)", text: "Unsaved changes",                              icon: "·"},
						].map(({bg, border, text, icon}) => (
							<div key={text} style={{
								display: "flex", alignItems: "center", gap: 8,
								padding: "5px 10px", fontSize: 11,
								background: bg,
								border: `1px solid ${border}`,
								borderRadius: 3,
							}}>
								<span style={{fontSize: 12, opacity: 0.7, flexShrink: 0}}>{icon}</span>
								<span style={{color: "var(--text-muted)"}}>{text}</span>
							</div>
						))}
					</div>
				</Tile>

			</Row>
		</Section>
	);
}
