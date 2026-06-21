export function SourceFilePill({path, onClick}: {
	path: string;
	onClick?: () => void;
}) {
	const filename = path.split("/").pop() ?? path;
	return (
		<span
			title={path}
			onClick={onClick}
			className="historica-source-pill"
			style={{
				display: "inline-flex", alignItems: "center",
				fontSize: 11, fontFamily: "var(--int-font-mono)",
				padding: "2px 8px", borderRadius: 9999,
				border: "1px solid var(--int-border)",
				color: "var(--int-on-surface-muted)",
				opacity: 0.6,
				cursor: onClick ? "pointer" : undefined,
				transition: "color 0.15s, opacity 0.15s",
			}}
		>
			{filename}
		</span>
	);
}
