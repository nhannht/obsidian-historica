import {CSSProperties} from "react";

export function Section({id, title, children}: {id: string; title: string; children: React.ReactNode}) {
	return (
		<div id={id} style={{marginBottom: 48}}>
			<div style={{
				fontSize: 10, fontVariant: "small-caps", letterSpacing: "0.12em",
				color: "var(--int-on-surface-faint)", marginBottom: 6,
			}}>§ {title}</div>
			<hr style={{borderColor: "var(--int-border)", margin: "0 0 16px"}}/>
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
			<div style={{fontSize: 9, fontFamily: "var(--int-font-mono)", color: "var(--int-on-surface-faint)", opacity: 0.6, letterSpacing: "0.06em"}}>
				{label}
			</div>
			<div style={{
				background: "var(--int-surface)",
				border: "1px solid var(--int-border)",
				borderRadius: 5, padding: 14,
			}}>
				{children}
			</div>
		</div>
	);
}
