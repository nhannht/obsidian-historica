import {useEffect, useState} from "react";
import {ReadImage} from "@/src/utils";
import HistoricaPlugin from "@/main";
import {arrayBufferToBase64} from "obsidian";
import {cn} from "@/src/lib/utils";

// Shown when the source file is missing, or when reading/decoding it fails.
const FALLBACK_ICON_SRC = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNpcmNsZS1oZWxwIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxwYXRoIGQ9Ik05LjA5IDlhMyAzIDAgMCAxIDUuODMgMWMwIDItMyAzLTMgMyIvPjxwYXRoIGQ9Ik0xMiAxN2guMDEiLz48L3N2Zz4=";

export default function ImageFromPath(props: {
	path: string,
	plugin: HistoricaPlugin,
	className?: string,
	width?: number | string,
	height?: number | string,
	handleClick?: (() => void) | undefined
}){
	const [imageSrc, setImageSrc] = useState<string | null>(null);

	const displayImage = async () => {
		try {
			const content = await ReadImage(props.plugin, props.path);
			// console.log(content)
			if (content instanceof  ArrayBuffer){
				const base64 = arrayBufferToBase64(content)

				setImageSrc(`data:image/png;base64,${base64}`);
			} else {
				setImageSrc(FALLBACK_ICON_SRC)
			}
			// console.log(base64)
		} catch (error) {
			console.error("Historica: failed to load image", props.path, error);
			setImageSrc(FALLBACK_ICON_SRC);
		}
	};

	useEffect(() => {
		// displayImage() catches its own errors and falls back to a placeholder icon,
		// so it never rejects to this caller.
		void displayImage();
	}, []);
	return <div >
		{imageSrc && <img
			onClick={props.handleClick}
			className={cn(props.className)}
			width={props.width}
			height={props.height}
			src={imageSrc}   alt={props.path}/>}
	</div>

}
