import type {ReactNode} from "react";

const VARIANT_STYLES: Record<string, {bg: string; border: string; color: string}> = {
	warning: {
		bg: "color-mix(in srgb, var(--int-anchor) 8%, transparent)",
		border: "color-mix(in srgb, var(--int-anchor) 25%, transparent)",
		color: "var(--int-anchor)",
	},
	info: {
		bg: "color-mix(in srgb, var(--int-on-surface-muted) 6%, transparent)",
		border: "color-mix(in srgb, var(--int-on-surface-muted) 15%, transparent)",
		color: "var(--int-on-surface-muted)",
	},
	muted: {
		bg: "transparent",
		border: "transparent",
		color: "var(--int-on-surface-muted)",
	},
};

export function StatusBanner({icon, message, variant = "info", onClick}: {
	icon?: ReactNode;
	message: string;
	variant?: "warning" | "info" | "muted";
	onClick?: () => void;
}) {
	const s = VARIANT_STYLES[variant];
	return (
		<div
			onClick={onClick}
			style={{
				display: "flex", alignItems: "center", gap: 6,
				fontSize: 11, fontFamily: "var(--int-font-mono)",
				color: s.color, background: s.bg,
				border: `1px solid ${s.border}`,
				padding: "4px 8px", borderRadius: 4,
				cursor: onClick ? "pointer" : undefined,
				opacity: variant === "muted" ? 0.6 : 1,
			}}
		>
			{icon && <span style={{flexShrink: 0}}>{icon}</span>}
			<span>{message}</span>
		</div>
	);
}
