import type {ReactNode} from "react";

export function SectionLabel({children, className}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={className}
			style={{
				fontSize: 9, fontFamily: "monospace",
				textTransform: "uppercase", letterSpacing: "0.08em",
				color: "var(--text-faint)",
			}}
		>
			{children}
		</div>
	);
}
