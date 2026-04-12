import { useMemo, useRef, useEffect, useState } from "react";
import { area, curveBasis } from "d3-shape";
import { scaleLinear, scaleTime } from "d3-scale";
import { GlobalEntry } from "./useVaultEntries";

const SPARKLINE_HEIGHT = 60;
const BUCKETS = 80;

interface DensitySparklineProps {
	entries: GlobalEntry[];
}

export function DensitySparkline({ entries }: DensitySparklineProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(600);

	// Observe container width
	useEffect(() => {
		if (!containerRef.current) return;
		const ro = new ResizeObserver(([entry]) => {
			setWidth(entry.contentRect.width);
		});
		ro.observe(containerRef.current);
		return () => ro.disconnect();
	}, []);

	const unixEntries = useMemo(
		() => entries.filter(e => e.unixTime !== null).map(e => e.unixTime!),
		[entries]
	);

	const sparkPath = useMemo(() => {
		if (unixEntries.length < 2) return null;

		const minT = unixEntries.reduce((a, b) => Math.min(a, b));
		const maxT = unixEntries.reduce((a, b) => Math.max(a, b));
		if (minT === maxT) return null;

		// Build density buckets
		const buckets = new Array<number>(BUCKETS).fill(0);
		const range = maxT - minT;
		for (const t of unixEntries) {
			const idx = Math.min(BUCKETS - 1, Math.floor(((t - minT) / range) * BUCKETS));
			buckets[idx]++;
		}

		const maxCount = Math.max(...buckets);

		const xScale = scaleLinear().domain([0, BUCKETS - 1]).range([0, width]);
		const yScale = scaleLinear().domain([0, maxCount]).range([SPARKLINE_HEIGHT - 2, 2]);

		const points: [number, number][] = buckets.map((count, i) => [xScale(i), yScale(count)]);

		const areaGen = area<[number, number]>()
			.x(d => d[0])
			.y0(SPARKLINE_HEIGHT)
			.y1(d => d[1])
			.curve(curveBasis);

		// Year tick positions
		const timeScale = scaleTime()
			.domain([new Date(minT), new Date(maxT)])
			.range([0, width]);

		const ticks = timeScale.ticks(6).map(d => ({
			x: timeScale(d),
			label: d.getFullYear().toString(),
		}));

		return { path: areaGen(points) ?? "", ticks };
	}, [unixEntries, width]);

	if (!sparkPath) return null;

	return (
		<div
			ref={containerRef}
			className="flex-shrink-0 w-full border-b border-[var(--background-modifier-border)]"
			style={{ height: SPARKLINE_HEIGHT }}
			title="Temporal density of all indexed entries"
		>
			<svg
				width={width}
				height={SPARKLINE_HEIGHT}
				style={{ display: "block" }}
			>
				{sparkPath && (
					<>
						<defs>
							<linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.5" />
								<stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.05" />
							</linearGradient>
						</defs>
						<path d={sparkPath.path} fill="url(#sparkGrad)" />
						{sparkPath.ticks.map(tick => (
							<g key={tick.label} transform={`translate(${tick.x},0)`}>
								<line
									y1={SPARKLINE_HEIGHT - 12}
									y2={SPARKLINE_HEIGHT - 4}
									stroke="var(--text-muted)"
									strokeWidth={0.5}
									strokeOpacity={0.5}
								/>
								<text
									y={SPARKLINE_HEIGHT - 1}
									textAnchor="middle"
									fontSize={9}
									fill="var(--text-muted)"
									opacity={0.7}
								>
									{tick.label}
								</text>
							</g>
						))}
					</>
				)}
			</svg>
		</div>
	);
}
