import {CSSProperties} from "react";
import {Section, Row, Tile} from "./helpers";
import {SIG_LEVELS} from "./constants";
import {Spinner} from "../Spinner";

export function ToolbarSection() {
	const btn: CSSProperties = {
		fontSize: 11, padding: "2px 6px", borderRadius: 3,
		color: "var(--text-muted)", cursor: "pointer",
		border: "1px solid transparent",
	};
	const iconBtn: CSSProperties = {
		display: "flex", alignItems: "center", justifyContent: "center",
		width: 22, height: 22, borderRadius: 3,
		color: "var(--text-muted)", cursor: "pointer",
	};
	return (
		<Section id="toolbar" title="Toolbar / Menubar">
			<Row gap={16} style={{alignItems: "flex-start"}}>

				<Tile label="toolbar · expanded">
					<div style={{
						border: "1px solid var(--background-modifier-border)",
						borderRadius: 5, width: 380, overflow: "hidden",
					}}>
						<div style={{
							display: "flex", alignItems: "center", justifyContent: "space-between",
							padding: "5px 10px",
							borderBottom: "1px solid var(--background-modifier-border)",
						}}>
							<div style={{display: "flex", alignItems: "center", gap: 6}}>
								<span style={{fontSize: 12, fontWeight: 600, color: "var(--text-normal)", cursor: "pointer"}}>
									Historica
								</span>
								<svg style={{width: 10, height: 10, color: "var(--text-faint)", opacity: 0.5}} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4L6 8L10 4"/></svg>
							</div>
							<div style={{display: "flex", alignItems: "center", gap: 4}}>
								<span style={{fontSize: 10, color: "var(--text-muted)", opacity: 0.6}}>Saved</span>
								<span style={{fontSize: 10, color: "var(--text-faint)", opacity: 0.4, margin: "0 2px"}}>·</span>
								<span style={{fontSize: 10, fontFamily: "monospace", color: "var(--text-faint)", opacity: 0.5}}>12 entries</span>
							</div>
						</div>
						<div style={{
							display: "flex", alignItems: "center", gap: 6,
							padding: "3px 10px",
							borderBottom: "1px solid color-mix(in srgb, var(--background-modifier-border) 50%, transparent)",
						}}>
							<span style={{fontFamily: "monospace", fontSize: 10, color: "var(--text-faint)"}}>12 dates</span>
							<span style={{color: "var(--text-faint)", opacity: 0.4, fontSize: 10}}>·</span>
							<span style={{fontFamily: "monospace", fontSize: 10, color: "var(--text-faint)"}}>47 sentences</span>
							<span style={{color: "var(--text-faint)", opacity: 0.4, fontSize: 10}}>·</span>
							<span style={{fontFamily: "monospace", fontSize: 10, color: "var(--text-faint)", opacity: 0.5}}>25%</span>
						</div>
						<div style={{display: "flex", alignItems: "center", gap: 2, padding: "4px 8px", flexWrap: "wrap"}}>
							<span style={{...btn, display: "inline-flex", alignItems: "center", gap: 4}}>
								<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1,6 4,9 11,2"/></svg>
								Parse
							</span>
							<div style={{width: 1, height: 14, background: "var(--background-modifier-border)", margin: "0 2px"}}/>
							<span style={btn}>↑↓ Sort</span>
							<span style={btn}>⊞ Expand all</span>
							<span style={btn}>◌ Show hidden</span>
							<div style={{width: 1, height: 14, background: "var(--background-modifier-border)", margin: "0 2px"}}/>
							<div style={{display: "flex", alignItems: "center", gap: 3}}>
								{SIG_LEVELS.map(n => (
									<div key={n} style={{
										width: 7, height: 7, borderRadius: "50%",
										background: n <= 2 ? "var(--interactive-accent)" : "transparent",
										border: `1.5px solid ${n <= 2 ? "var(--interactive-accent)" : "color-mix(in srgb, var(--text-faint) 40%, transparent)"}`,
										opacity: n <= 2 ? 1 : 0.4, cursor: "pointer",
									}}/>
								))}
							</div>
							<div style={{marginLeft: "auto", display: "flex", gap: 2}}>
								<span style={iconBtn} title="Export PNG">
									<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 9h8M6 2v5M3 5l3 3 3-3"/></svg>
								</span>
								<span style={iconBtn} title="Save">
									<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 2h7l1 1v7H2z"/><path d="M4 2v3h4V2"/><rect x="3" y="7" width="6" height="3" rx="0.5"/></svg>
								</span>
							</div>
						</div>
					</div>
				</Tile>

				<Tile label="toolbar · collapsed">
					<div style={{
						border: "1px solid var(--background-modifier-border)",
						borderRadius: 5, width: 280,
					}}>
						<div style={{
							display: "flex", alignItems: "center", justifyContent: "space-between",
							padding: "5px 10px",
						}}>
							<div style={{display: "flex", alignItems: "center", gap: 6}}>
								<span style={{fontSize: 12, fontWeight: 600, color: "var(--text-normal)", cursor: "pointer"}}>
									Historica
								</span>
								<svg style={{width: 10, height: 10, color: "var(--text-faint)", opacity: 0.5, transform: "rotate(-90deg)"}} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4L6 8L10 4"/></svg>
							</div>
							<span style={{fontSize: 10, color: "var(--text-muted)", opacity: 0.6}}>12 entries · Saved</span>
						</div>
					</div>
				</Tile>

				<Tile label="save status · variants">
					<div style={{display: "flex", flexDirection: "column", gap: 8}}>
						{[
							{label: "Saved",         color: "var(--text-muted)",   opacity: 0.5},
							{label: "Unsaved",        color: "var(--text-accent)",  opacity: 1},
							{label: "Saving…",        color: "var(--text-muted)",   opacity: 0.7},
							{label: "Not saved yet",  color: "var(--text-faint)",   opacity: 0.5},
						].map(({label, color, opacity}) => (
							<div key={label} style={{display: "flex", alignItems: "center", gap: 6}}>
								<span style={{fontSize: 10, color, opacity, fontFamily: "monospace", minWidth: 90}}>{label}</span>
								{label === "Saving…" && <Spinner size={10}/>}
							</div>
						))}
					</div>
				</Tile>

			</Row>
		</Section>
	);
}
