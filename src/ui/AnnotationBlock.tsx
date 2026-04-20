import type React from "react";

export function AnnotationBlock({children, hasContent}: {
	children: React.ReactNode;
	hasContent: boolean;
}) {
	return (
		<div
			className="mt-2"
			style={hasContent ? {borderLeft: "2px solid rgba(251,191,36,0.45)", paddingLeft: 10} : {}}
		>
			{hasContent && (
				<span style={{fontSize: 10, fontVariant: "small-caps", color: "var(--text-faint)", letterSpacing: "0.04em", display: "block", marginBottom: 2}}>
					annotation
				</span>
			)}
			<div style={hasContent ? {fontStyle: "italic"} : {}}>
				{children}
			</div>
		</div>
	);
}
