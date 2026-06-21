import type React from "react";

export function AnnotationBlock({children, hasContent}: {
	children: React.ReactNode;
	hasContent: boolean;
}) {
	return (
		<div
			className="mt-2"
			style={hasContent ? {background: "var(--int-accent-tint)", borderRadius: 4, padding: "6px 10px"} : {}}
		>
			{hasContent && (
				<span style={{fontSize: 10, fontVariant: "small-caps", color: "var(--int-on-surface-faint)", letterSpacing: "0.04em", display: "block", marginBottom: 2}}>
					annotation
				</span>
			)}
			<div style={hasContent ? {color: "var(--int-on-surface-muted)"} : {}}>
				{children}
			</div>
		</div>
	);
}
