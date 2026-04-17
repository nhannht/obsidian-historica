
export function PrecisionGutter({opacity, radius = 2}: {opacity: number; radius?: number}) {
	return (
		<div style={{
			position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
			background: "var(--interactive-accent)", opacity, borderRadius: radius,
		}}/>
	);
}
