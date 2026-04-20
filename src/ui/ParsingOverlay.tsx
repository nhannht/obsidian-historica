import {Spinner} from "./Spinner";

export function ParsingOverlay({visible, message = "Parsing\u2026"}: {
	visible: boolean;
	message?: string;
}) {
	if (!visible) return null;
	return (
		<div style={{
			position: "absolute", inset: 0,
			display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
			background: "color-mix(in srgb, var(--background-primary) 80%, transparent)",
			zIndex: 10, borderRadius: "inherit",
		}}>
			<Spinner size={18}/>
			<span style={{fontSize: 12, color: "var(--text-muted)"}}>{message}</span>
		</div>
	);
}
