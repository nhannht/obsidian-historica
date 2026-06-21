import type React from "react";

type Variant = "normal" | "approximate" | "anchor";
type Size = "sm" | "md";

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
	normal: {
		color: "var(--int-accent-strong)",
		background: "var(--int-accent-tint)",
	},
	approximate: {
		color: "var(--int-on-surface-faint)", opacity: 0.6,
		border: "1px dashed color-mix(in srgb, var(--int-on-surface-faint) 40%, transparent)",
	},
	anchor: {
		color: "var(--int-anchor)",
		background: "var(--int-anchor-tint)",
		border: "1px solid color-mix(in srgb, var(--int-anchor) 30%, transparent)",
	},
};

const SIZE_STYLES: Record<Size, React.CSSProperties> = {
	md: {fontSize: 11, padding: "2px 6px", borderRadius: 3},
	sm: {fontSize: 10, padding: "1px 5px", borderRadius: 2},
};

export function DateChip({children, variant = "normal", size = "md"}: {
	children: React.ReactNode;
	variant?: Variant;
	size?: Size;
}) {
	return (
		<span style={{fontFamily: "var(--int-font-mono)", flexShrink: 0, ...SIZE_STYLES[size], ...VARIANT_STYLES[variant]}}>
			{children}
		</span>
	);
}
