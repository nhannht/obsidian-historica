import {useMemo} from "react";

export function RugHeat({years, min, max, width, tickH = 10, stripeH = 5}: {
	years: number[], min: number, max: number,
	width: number, tickH?: number, stripeH?: number,
}) {
	const range = max - min;
	const toX = (y: number) => Math.round(((y - min) / range) * width);

	const {buckets, maxBucket, bw} = useMemo(() => {
		const BUCKETS = 20;
		const b = new Array<number>(BUCKETS).fill(0);
		for (const y of years) {
			const idx = Math.min(BUCKETS - 1, Math.floor(((y - min) / range) * BUCKETS));
			b[idx]++;
		}
		return {buckets: b, maxBucket: Math.max(...b, 1), bw: width / BUCKETS};
	}, [years, min, range, width]);

	const baselineY = tickH + 1;
	const totalH = tickH + 2 + stripeH + 12;

	return (
		<svg width={width} height={totalH} style={{display: "block", overflow: "visible"}}>
			{buckets.map((count, i) => (
				<rect key={i}
					x={i * bw} y={baselineY + 1}
					width={bw + 0.5} height={stripeH}
					fill="var(--interactive-accent)"
					opacity={count > 0 ? (count / maxBucket) * 0.8 : 0}
				/>
			))}
			<line x1={0} y1={baselineY} x2={width} y2={baselineY}
				stroke="var(--background-modifier-border)" strokeWidth={0.75}/>
			{years.map((y, i) => (
				<line key={i}
					x1={toX(y)} y1={2} x2={toX(y)} y2={tickH - 1}
					stroke="var(--interactive-accent)" strokeWidth={1.5} opacity={0.7}
				/>
			))}
			<text x={1} y={totalH} style={{fontSize: "8px", fill: "var(--text-faint)", fontFamily: "monospace"}}>{min}</text>
			<text x={width - 1} y={totalH} textAnchor="end" style={{fontSize: "8px", fill: "var(--text-faint)", fontFamily: "monospace"}}>{max}</text>
		</svg>
	);
}
