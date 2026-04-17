import {Fragment, useRef, useState} from "react";
import {MenuItem, MenuNode} from "@/src/ui/menuTypes";

interface MenuPanelProps {
	items: MenuNode[];
	onClose: () => void;
}

const PANEL_STYLE: React.CSSProperties = {
	background: "var(--background-primary)",
	border: "1px solid var(--background-modifier-border)",
	borderRadius: 3,
	padding: "3px 0",
	minWidth: 180,
	boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

const ITEM_BASE: React.CSSProperties = {
	display: "flex", alignItems: "center", justifyContent: "space-between",
	padding: "5px 10px", fontSize: 12, fontFamily: "monospace",
	cursor: "pointer", userSelect: "none",
};

function itemStyles(item: MenuItem): React.CSSProperties {
	return {
		color: item.muted || item.disabled ? "var(--text-faint)" : "var(--text-normal)",
		opacity: item.disabled ? 0.5 : 1,
	};
}

function SubmenuPanel({item, onClose}: {item: MenuItem; onClose: () => void}) {
	const triggerRef = useRef<HTMLDivElement>(null);
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [subPos, setSubPos] = useState<{x: number; y: number} | null>(null);

	function handleEnter() {
		if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
		if (!triggerRef.current) return;
		const rect = triggerRef.current.getBoundingClientRect();
		let x = rect.right + 2;
		const panelWidth = 200;
		if (x + panelWidth > window.innerWidth) x = rect.left - panelWidth - 2;
		setSubPos({x, y: rect.top});
	}

	function handleLeave() {
		closeTimerRef.current = setTimeout(() => setSubPos(null), 150);
	}

	const hasSubmenu = item.submenu && item.submenu.length > 0;
	const hasContent = !!item.submenuContent;

	return (
		<div
			ref={triggerRef}
			style={{...ITEM_BASE, ...itemStyles(item)}}
			onMouseEnter={e => {
				handleEnter();
				if (!item.disabled) (e.currentTarget as HTMLDivElement).style.background = "var(--background-secondary)";
			}}
			onMouseLeave={e => {
				handleLeave();
				(e.currentTarget as HTMLDivElement).style.background = "transparent";
			}}
		>
			<span>{item.label}</span>
			{(hasSubmenu || hasContent) && <span style={{opacity: 0.5, marginLeft: 8}}>›</span>}

			{subPos && (hasSubmenu || hasContent) && (
				<div
					style={{position: "fixed", left: subPos.x, top: subPos.y, zIndex: 10000}}
					onMouseEnter={() => {
						if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
					}}
					onMouseLeave={handleLeave}
					onMouseDown={e => e.stopPropagation()}
				>
					{hasContent && <div style={PANEL_STYLE}>{item.submenuContent}</div>}
					{hasSubmenu && <MenuPanel items={item.submenu!} onClose={onClose}/>}
				</div>
			)}
		</div>
	);
}

export function MenuPanel({items, onClose}: MenuPanelProps) {
	return (
		<div style={PANEL_STYLE}>
			{items.map((node, i) => (
				<Fragment key={i}>
					{node.type === "separator" ? (
						<div style={{borderTop: "1px solid var(--background-modifier-border)", margin: "3px 0"}}/>
					) : (node.submenu || node.submenuContent) ? (
						<SubmenuPanel item={node} onClose={onClose}/>
					) : (
						<div
							style={{...ITEM_BASE, ...itemStyles(node)}}
							onMouseEnter={e => {
								if (!node.disabled) (e.currentTarget as HTMLDivElement).style.background = "var(--background-secondary)";
							}}
							onMouseLeave={e => {
								(e.currentTarget as HTMLDivElement).style.background = "transparent";
							}}
							onMouseDown={e => {
								e.stopPropagation();
								if (!node.disabled && node.onClick) {
									node.onClick();
									onClose();
								}
							}}
						>
							{node.label}
						</div>
					)}
				</Fragment>
			))}
		</div>
	);
}
