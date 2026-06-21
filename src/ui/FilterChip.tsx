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
				fontSize: 11, fontFamily: "var(--int-font-mono)",
				padding: "2px 8px", borderRadius: 9999,
				border: `1px solid ${active ? "var(--int-primary)" : "var(--int-border)"}`,
				color: active ? "var(--int-accent-strong)" : "var(--int-on-surface-muted)",
				background: active ? "var(--int-accent-tint)" : "transparent",
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
