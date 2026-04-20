export function ManualBadge({title}: {title?: string}) {
	return (
		<span
			title={title}
			style={{
				flexShrink: 0,
				fontSize: 9, fontFamily: "monospace",
				color: "var(--text-faint)", opacity: 0.65,
				border: "2px solid var(--text-faint)",
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
				fontSize: 9, fontFamily: "monospace",
				color: "var(--text-warning)", opacity: 0.8,
				border: "1px solid color-mix(in srgb, var(--text-warning) 35%, transparent)",
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
				fontSize: 10, fontFamily: "monospace",
				color: "var(--text-accent)",
				background: "color-mix(in srgb, var(--interactive-accent) 20%, transparent)",
				padding: "2px 4px", borderRadius: 3,
				textTransform: "uppercase",
			}}
		>
			{ext}
		</span>
	);
}
