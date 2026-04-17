import {Fragment} from "react";
import {Section, Row, Tile} from "./helpers";

export function ContextMenuSection() {
	return (
		<Section id="context-menu" title="Context Menu">
			<Row gap={24}>
				<Tile label="monospace / minimal">
					<div style={{
						background: "var(--background-primary)",
						border: "1px solid var(--background-modifier-border)",
						minWidth: 200,
					}}>
						{[
							{sym: "→", text: "Jump to source",    muted: false, sep: false},
							{sym: "+", text: "Add attachment ›",  muted: false, sep: true},
							{sym: "~", text: "Hide from view",    muted: false, sep: false},
							{sym: "×", text: "Dismiss extraction",muted: true,  sep: false},
						].map(({sym, text, muted, sep}) => (
							<Fragment key={text}>
								<div style={{
									display: "flex", alignItems: "center", gap: 8,
									padding: "5px 10px", fontSize: 12, fontFamily: "monospace",
									color: muted ? "var(--text-faint)" : "var(--text-normal)", cursor: "pointer",
								}}>
									<span style={{color: "var(--text-faint)", minWidth: 10}}>{sym}</span>
									{text}
								</div>
								{sep && <div style={{borderTop: "1px dashed var(--background-modifier-border)", margin: "3px 0"}}/>}
							</Fragment>
						))}
					</div>
				</Tile>

				<Tile label="dispatch labels · left column">
					<div style={{
						background: "var(--background-primary)",
						border: "1px solid var(--background-modifier-border)",
						minWidth: 220,
					}}>
						{[
							{code: "JUMP", text: "Jump to source",    muted: false, sep: false},
							{code: "LINK", text: "Add attachment ›",  muted: false, sep: true},
							{code: "HIDE", text: "Hide from view",    muted: false, sep: false},
							{code: "DROP", text: "Dismiss extraction",muted: true,  sep: false},
						].map(({code, text, muted, sep}) => (
							<Fragment key={code}>
								<div style={{
									display: "flex", alignItems: "baseline", gap: 10,
									padding: "5px 12px", cursor: "pointer",
								}}>
									<span style={{fontSize: 8, fontFamily: "monospace", color: "var(--text-faint)", opacity: 0.55, letterSpacing: "0.1em", minWidth: 34}}>{code}</span>
									<span style={{fontSize: 13, color: muted ? "var(--text-muted)" : "var(--text-normal)"}}>{text}</span>
								</div>
								{sep && <hr style={{borderColor: "var(--background-modifier-border)", margin: "3px 0"}}/>}
							</Fragment>
						))}
					</div>
				</Tile>

				<Tile label="borderless · inset hover">
					<div style={{minWidth: 200, padding: "4px 0"}}>
						{[
							{text: "Jump to source",    muted: false, sep: false},
							{text: "Add attachment ›",  muted: false, sep: true},
							{text: "Hide from view",    muted: false, sep: false},
							{text: "Dismiss extraction",muted: true,  sep: false},
						].map(({text, muted, sep}) => (
							<Fragment key={text}>
								<div style={{
									padding: "5px 14px", fontSize: 13,
									color: muted ? "var(--text-muted)" : "var(--text-normal)",
									cursor: "pointer",
								}}>{text}</div>
								{sep && <div style={{height: 1, margin: "3px 8px", background: "var(--background-modifier-border)"}}/>}
							</Fragment>
						))}
					</div>
				</Tile>
			</Row>
		</Section>
	);
}
