import {ReactNode, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";

interface HoverTooltipProps {
	children: ReactNode;
	content: ReactNode;
	delay?: number;
}

export function HoverTooltip({children, content, delay = 400}: HoverTooltipProps) {
	const [visible, setVisible] = useState(false);
	const [pos, setPos] = useState({x: 0, y: 0});
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

	function handleMouseEnter(e: React.MouseEvent) {
		const x = e.clientX;
		const y = e.clientY;
		timerRef.current = setTimeout(() => {
			setPos({x, y});
			setVisible(true);
		}, delay);
	}

	function handleMouseLeave() {
		if (timerRef.current) clearTimeout(timerRef.current);
		setVisible(false);
	}

	return (
		<>
			<div style={{display: "contents"}} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
				{children}
			</div>
			{visible && createPortal(
				<div style={{
					position: "fixed", left: pos.x + 12, top: pos.y + 12,
					zIndex: 10000, pointerEvents: "none",
					background: "var(--background-primary)",
					border: "1px solid var(--background-modifier-border)",
					borderRadius: 4, padding: 6, maxWidth: 260,
					boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
				}}>
					{content}
				</div>,
				document.body
			)}
		</>
	);
}
