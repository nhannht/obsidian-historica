
export function PrecisionGutter({opacity, radius = 2, title}: {opacity: number; radius?: number; title?: string}) {
	return (
		<div title={title} style={{
			position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
			background: "var(--interactive-accent)", opacity, borderRadius: radius,
			transition: "opacity var(--historica-dur-snap, 110ms)",
		}}/>
	);
}
