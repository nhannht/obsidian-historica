import {useEffect, useState} from "react";
import {ReadImage} from "../../global";
import HistoricaPlugin from "../../../main";
import {arrayBufferToBase64} from "obsidian";
import {cn} from "@/lib/utils";


export default function ImageFromPath (props:{
	path:string,
	plugin:HistoricaPlugin,
	className?:string,
	width?: number|string,
	height?: number|string

}){
	const [imageSrc, setImageSrc] = useState<string | null>(null);

	const displayImage = async () => {
		const content = await ReadImage(props.plugin, props.path);
		// console.log(content)
		if (content instanceof  ArrayBuffer){
			const base64 = arrayBufferToBase64(content)

			setImageSrc(`data:image/png;base64,${base64}`);
		} else {
			setImageSrc(`data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNpcmNsZS1oZWxwIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxwYXRoIGQ9Ik05LjA5IDlhMyAzIDAgMCAxIDUuODMgMWMwIDItMyAzLTMgMyIvPjxwYXRoIGQ9Ik0xMiAxN2guMDEiLz48L3N2Zz4=`)
		}
		// console.log(base64)
	};

	useEffect(() => {
		 displayImage().then();
	}, []);
	return <div >
		{imageSrc && <img
			className={cn(props.className)}
			width={props.width}
			height={props.height}
			src={imageSrc}  />}
	</div>

}
