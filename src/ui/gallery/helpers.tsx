import {CSSProperties} from "react";

export function Section({id, title, children}: {id: string; title: string; children: React.ReactNode}) {
	return (
		<div id={id} style={{marginBottom: 48}}>
			<div style={{
				fontSize: 10, fontVariant: "small-caps", letterSpacing: "0.12em",
				color: "var(--text-faint)", marginBottom: 6,
			}}>§ {title}</div>
			<hr style={{borderColor: "var(--background-modifier-border)", margin: "0 0 16px"}}/>
			{children}
		</div>
	);
}

export function Row({gap = 16, children, style}: {gap?: number; children: React.ReactNode; style?: CSSProperties}) {
	return (
		<div style={{display: "flex", flexWrap: "wrap", gap, alignItems: "flex-start", ...style}}>
			{children}
		</div>
	);
}

export function Tile({label, children}: {label: string; children: React.ReactNode}) {
	return (
		<div style={{display: "flex", flexDirection: "column", gap: 8}}>
			<div style={{fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)", opacity: 0.6, letterSpacing: "0.06em"}}>
				{label}
			</div>
			<div style={{
				background: "var(--background-primary)",
				border: "1px solid var(--background-modifier-border)",
				borderRadius: 5, padding: 14,
			}}>
				{children}
			</div>
		</div>
	);
}
