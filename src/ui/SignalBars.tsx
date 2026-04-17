import {motion} from "motion/react";
import {DUR} from "./animTokens";
import {SIG_LEVELS} from "./gallery/constants";

type Size = "sm" | "md";

const SIZES: Record<Size, {width: number; heightMult: number; heightBase: number; gap: number; border: number; borderRadius: number}> = {
	md: {width: 8, heightMult: 5, heightBase: 3, gap: 3, border: 1.5, borderRadius: 2},
	sm: {width: 5, heightMult: 3, heightBase: 2, gap: 2, border: 1,   borderRadius: 1},
};

export function SignalBars({sig, size = "md"}: {sig: number; size?: Size}) {
	const {width, heightMult, heightBase, gap, border, borderRadius} = SIZES[size];
	return (
		<div style={{display: "flex", alignItems: "flex-end", gap}}>
			{SIG_LEVELS.map(n => {
				const filled = n <= sig;
				return (
					<motion.div
						key={n}
						initial={false}
						animate={{
							backgroundColor: filled ? "var(--interactive-accent)" : "transparent",
							opacity: filled ? 1 : 0.35,
						}}
						transition={{delay: (n - 1) * 0.03, duration: DUR.micro}}
						style={{
							width,
							height: n * heightMult + heightBase,
							border: `${border}px solid ${filled ? "var(--interactive-accent)" : "color-mix(in srgb, var(--text-faint) 35%, transparent)"}`,
							borderRadius,
						}}
					/>
				);
			})}
		</div>
	);
}
