import {ReactNode, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {MenuNode} from "@/src/ui/menuTypes";
import {MenuPanel} from "@/src/ui/MenuPanel";
import {useCloseOnOutsideOrEscape} from "@/src/ui/useCloseOnOutsideOrEscape";

interface NativeDropdownMenuProps {
	trigger: ReactNode;
	items: MenuNode[];
	triggerClassName?: string;
	triggerStyle?: React.CSSProperties;
	disabled?: boolean;
	onTriggerClick?: () => void;
}

export function NativeDropdownMenu({trigger, items, triggerClassName, triggerStyle, disabled, onTriggerClick}: NativeDropdownMenuProps) {
	const [open, setOpen] = useState(false);
	const [pos, setPos] = useState({x: 0, y: 0});
	const buttonRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	useCloseOnOutsideOrEscape(open, () => setOpen(false), panelRef, buttonRef);

	function handleClick() {
		if (disabled) return;
		onTriggerClick?.();
		if (!buttonRef.current) return;
		const rect = buttonRef.current.getBoundingClientRect();
		setPos({x: rect.left, y: rect.bottom + 2});
		setOpen(prev => !prev);
	}

	return (
		<>
			<button ref={buttonRef} className={triggerClassName} style={triggerStyle} disabled={disabled} onClick={handleClick}>
				{trigger}
			</button>
			{open && createPortal(
				<div ref={panelRef} style={{position: "fixed", left: pos.x, top: pos.y, zIndex: 9999}}>
					<MenuPanel items={items} onClose={() => setOpen(false)}/>
				</div>,
				document.body
			)}
		</>
	);
}
