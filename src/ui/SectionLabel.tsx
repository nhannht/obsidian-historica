import type {ReactNode} from "react";

export function SectionLabel({children, className}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={className}
			style={{
				fontSize: 9, fontFamily: "var(--int-font-mono)",
				textTransform: "uppercase", letterSpacing: "0.08em",
				color: "var(--int-on-surface-faint)",
			}}
		>
			{children}
		</div>
	);
}
