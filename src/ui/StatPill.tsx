export function StatPill({value, label}: {
	value: string | number;
	label?: string;
}) {
	return (
		<span style={{
			display: "inline-flex", alignItems: "center", gap: 4,
			flexShrink: 0,
			fontSize: 10, fontFamily: "monospace",
			padding: "2px 8px", borderRadius: 9999,
			color: "var(--text-muted)",
			background: "color-mix(in srgb, var(--text-muted) 8%, transparent)",
		}}>
			<span>{value}</span>
			{label && <span style={{opacity: 0.6}}>{label}</span>}
		</span>
	);
}
