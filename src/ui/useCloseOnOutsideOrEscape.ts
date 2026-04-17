import {RefObject, useEffect} from "react";

export function useCloseOnOutsideOrEscape(
	open: boolean,
	close: () => void,
	...refs: RefObject<Element | null>[]
) {
	useEffect(() => {
		if (!open) return;
		function handleDown(e: MouseEvent) {
			if (refs.every(r => r.current && !r.current.contains(e.target as Node))) {
				close();
			}
		}
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") close();
		}
		document.addEventListener("mousedown", handleDown);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handleDown);
			document.removeEventListener("keydown", handleKey);
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);
}
