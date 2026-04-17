import {ReactNode, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {MenuNode} from "@/src/ui/menuTypes";
import {MenuPanel} from "@/src/ui/MenuPanel";
import {useCloseOnOutsideOrEscape} from "@/src/ui/useCloseOnOutsideOrEscape";

interface NativeContextMenuProps {
	items: MenuNode[];
	children: ReactNode;
}

export function NativeContextMenu({items, children}: NativeContextMenuProps) {
	const [open, setOpen] = useState(false);
	const [pos, setPos] = useState({x: 0, y: 0});
	const panelRef = useRef<HTMLDivElement>(null);

	useCloseOnOutsideOrEscape(open, () => setOpen(false), panelRef);

	function handleContextMenu(e: React.MouseEvent) {
		e.preventDefault();
		setPos({x: e.clientX, y: e.clientY});
		setOpen(true);
	}

	return (
		<>
			<div style={{display: "contents"}} onContextMenu={handleContextMenu}>
				{children}
			</div>
			{open && createPortal(
				<div ref={panelRef} style={{position: "fixed", left: pos.x, top: pos.y, zIndex: 9999}}>
					<MenuPanel items={items} onClose={() => setOpen(false)}/>
				</div>,
				document.body
			)}
		</>
	);
}
