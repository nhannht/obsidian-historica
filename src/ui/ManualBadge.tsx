export function ManualBadge({title}: {title?: string}) {
	return (
		<span
			title={title}
			style={{
				flexShrink: 0,
				fontSize: 9, fontFamily: "var(--int-font-mono)",
				color: "var(--int-on-surface-muted)", opacity: 0.65,
				border: "1px solid var(--int-border)",
				padding: "1px 5px",
				textTransform: "uppercase", letterSpacing: "0.1em",
			}}
		>
			manual
		</span>
	);
}

export function AnchorBadge({title}: {title?: string}) {
	return (
		<span
			title={title}
			style={{
				flexShrink: 0,
				fontSize: 9, fontFamily: "var(--int-font-mono)",
				color: "var(--int-anchor-text)", opacity: 0.8,
				background: "var(--int-anchor-tint)",
				border: "1px solid color-mix(in srgb, var(--int-anchor) 35%, transparent)",
				padding: "1px 5px", borderRadius: 2,
			}}
		>
			ref
		</span>
	);
}

export function FileExtBadge({ext}: {ext: string}) {
	return (
		<span
			style={{
				flexShrink: 0,
				fontSize: 10, fontFamily: "var(--int-font-mono)",
				color: "var(--int-accent-strong)",
				background: "var(--int-accent-tint)",
				padding: "2px 4px", borderRadius: 3,
				textTransform: "uppercase",
			}}
		>
			{ext}
		</span>
	);
}
