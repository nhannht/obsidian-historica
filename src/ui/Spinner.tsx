
export function Spinner({size = 16}: {size?: number}) {
	return (
		<svg
			width={size} height={size}
			viewBox="0 0 16 16"
			fill="none"
			style={{animation: "historica-spin 0.8s linear infinite", flexShrink: 0}}
		>
			<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
			<path d="M8 2 A6 6 0 0 1 14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
		</svg>
	);
}
