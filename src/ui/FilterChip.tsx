export function FilterChip({label, onRemove, active, onClick}: {
	label: string;
	onRemove?: () => void;
	active?: boolean;
	onClick?: () => void;
}) {
	return (
		<span
			onClick={onClick}
			style={{
				display: "inline-flex", alignItems: "center", gap: 4,
				fontSize: 11, fontFamily: "monospace",
				padding: "2px 8px", borderRadius: 9999,
				border: `1px solid ${active ? "var(--interactive-accent)" : "var(--background-modifier-border)"}`,
				color: active ? "var(--text-accent)" : "var(--text-muted)",
				background: active ? "color-mix(in srgb, var(--interactive-accent) 10%, transparent)" : "transparent",
				cursor: onClick ? "pointer" : undefined,
				transition: "all 0.15s",
			}}
		>
			{label}
			{onRemove && (
				<span
					onClick={(e) => { e.stopPropagation(); onRemove(); }}
					style={{cursor: "pointer", opacity: 0.6, fontSize: 10, lineHeight: 1}}
				>
					&times;
				</span>
			)}
		</span>
	);
}
