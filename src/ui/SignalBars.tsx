import {SIG_LEVELS} from "./gallery/constants";

type Size = "sm" | "md";

const SIZES: Record<Size, {width: number; heightMult: number; heightBase: number; gap: number}> = {
	md: {width: 8, heightMult: 5, heightBase: 3, gap: 3},
	sm: {width: 5, heightMult: 3, heightBase: 2, gap: 2},
};

export function SignalBars({sig, size = "md"}: {sig: number; size?: Size}) {
	const {width, heightMult, heightBase, gap} = SIZES[size];
	return (
		<div style={{display: "flex", alignItems: "flex-end", gap}}>
			{SIG_LEVELS.map(n => {
				const filled = n <= sig;
				return (
					<div key={n} style={{
						width, height: n * heightMult + heightBase,
						background: filled ? "var(--interactive-accent)" : "transparent",
						border: `${size === "sm" ? 1 : 1.5}px solid ${filled ? "var(--interactive-accent)" : "color-mix(in srgb, var(--text-faint) 35%, transparent)"}`,
						opacity: filled ? 1 : 0.35,
						borderRadius: size === "sm" ? 1 : 2,
					}}/>
				);
			})}
		</div>
	);
}
