import type React from "react";

type Variant = "normal" | "approximate" | "anchor";
type Size = "sm" | "md";

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
	normal: {
		color: "var(--text-accent)",
		background: "color-mix(in srgb, var(--interactive-accent) 10%, transparent)",
	},
	approximate: {
		color: "var(--text-faint)", opacity: 0.6,
		border: "1px dashed color-mix(in srgb, var(--text-faint) 40%, transparent)",
	},
	anchor: {
		color: "var(--text-warning)",
		background: "color-mix(in srgb, var(--text-warning) 10%, transparent)",
		border: "1px solid color-mix(in srgb, var(--text-warning) 30%, transparent)",
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
		<span style={{fontFamily: "monospace", flexShrink: 0, ...SIZE_STYLES[size], ...VARIANT_STYLES[variant]}}>
			{children}
		</span>
	);
}
