import {MarkdownPostProcessorContext} from "obsidian";
import HistoricaPlugin from "@/main";
import {HistoricaSettingNg, PlotUnit} from "@/src/global";
import {PropsWithChildren, useEffect, useRef, useState} from "react";
import MarkdownProcesser from "@/src/MarkdownProcesser";
import {NavigationMenuLink, navigationMenuTriggerStyle} from "@/src/ui/shadcn/NavigationMenu"
import {cn} from "@/lib/utils";
import SettingReactComponent from "@/src/SettingReactComponent";
import {TimelineI} from "@/src/TimelineI";
import {TimelineII} from "@/src/TimelineII";
import HistoricaExportHelper from "@/src/backgroundLogic/HistoricaExportHelper";


function ListItem(props: PropsWithChildren<{
	title: string,
	page: string,
	className?: string,
	setPage: (p: string) => void
}>) {
	return (
		<NavigationMenuLink

			className={navigationMenuTriggerStyle()}>
			<li
				onClick={() => {
					props.setPage(props.page)

				}}

				className={cn(
					"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
					props.className
				)}

			>
				<div className="text-sm font-medium leading-none">{props.title}</div>
				<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
					{props.children}
				</p>

			</li>
		</NavigationMenuLink>
	)

}

const pages = [
	{
		title: "Timeline",
		page: "timeline"
	},
	{
		title: "Setting",
		page: "setting"
	}
]

export function NavigationMenuReactComponent(props: {
	page: string,
	setPage: (p: string) => void,
	handleConvertToPngAndSave?: ()=>void,
	handleConvertToPngAndCopy?: ()=>void,
	handleConvertToPdfAndSave?: ()=>void
}) {

	// return <NavigationMenu>
	// 	<NavigationMenuList >
	// 		<NavigationMenuItem>
	// 			<NavigationMenuTrigger className={"m-0 "}>Menu</NavigationMenuTrigger>
	// 			<NavigationMenuContent>
	// 				<ul className="grid w-[200px] gap-4 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
	// 					{pages.map(p => {
	// 						return <ListItem key={p.page} title={p.title} page={p.page} setPage={props.setPage}
	//
	// 						/>
	// 					})}
	//
	// 				</ul>
	// 			</NavigationMenuContent>
	// 		</NavigationMenuItem>
	// 	</NavigationMenuList>
	// </NavigationMenu>

	return (
		<div className={"flex flex-row justify-around p-2 "}>
			{pages.map((p, i) => {
				return <button
					key={i}
					onClick={() => {
						props.setPage(p.page)
					}}
				>{p.title}</button>
			})}
			{props.handleConvertToPngAndSave ? <button onClick={props.handleConvertToPngAndSave}>Save as Image</button> : null}
			{props.handleConvertToPngAndCopy ? <button onClick={props.handleConvertToPngAndCopy}>Copy as Image</button> : null }
		</div>
	)

}


export function HistoricaBlockReactComponent(props: {
	src: string,
	ctx: MarkdownPostProcessorContext,
	thisPlugin: HistoricaPlugin
	setting: HistoricaSettingNg
}) {

	const [plotUnit, setPlotUnit] = useState<PlotUnit[]>([])

	const elementRef = useRef<HTMLDivElement | null>(null);
	const exportHelper = new HistoricaExportHelper();


	useEffect(() => {
		const extractTimeline = async () => {
			const markdownProcesser = new MarkdownProcesser(props.thisPlugin, props.setting)
			await markdownProcesser.parseAllFilesNg()
			// const allnodes = markdownProcesser.nodes
			const currentFile = props.thisPlugin.app.workspace.getActiveFile()
			if (currentFile) {
				let text = await props.thisPlugin.app.vault.read(currentFile)
				const sentencesWithOffSet = await markdownProcesser.ExtractValidSentences(text)
				// console.log(sentencesWithOffSet)
				const plotUnits = await markdownProcesser.GetPlotUnits(sentencesWithOffSet)
				setPlotUnit(plotUnits)
			}
			// console.log(allnodes)
		}
		extractTimeline().then()
	},[])

	// useEffect(()=>{
	// 	console.log(plotUnit)
	// },[plotUnit])

	const [internalSetting, setInternalSetting] =
		useState<HistoricaSettingNg>(structuredClone(props.setting))
	const [page, setPage] = useState("timeline")

	const handleConvertToPngAndSave = async () => {
		if (elementRef.current) {
			const imageData = await exportHelper.convertHTMLToImageData(elementRef.current);
			// Create a link element
			const link = document.createElement('a');
			link.href = imageData;
			link.download = 'exported-image.png';

			// Append to the body, click and remove it
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);


		}
	};

	const handleConvertToPngAndCopyToClipboard = async ()=>{
		if (elementRef.current){
			const imageData = await exportHelper.convertHTMLToImageData(elementRef.current)
			// Convert the image data URL to a Blob
			const response = await fetch(imageData);
			const blob = await response.blob();

			// Use the Clipboard API to write the image to the clipboard
			try {
				await navigator.clipboard.write([
					new ClipboardItem({
						[blob.type]: blob
					})
				]);
				console.log("Image copied to clipboard successfully!");
			} catch (error) {
				console.error("Failed to copy image to clipboard:", error);
			}

		}
	}





	if (page === "timeline") {
		return <div>
			<NavigationMenuReactComponent page={page} setPage={setPage}
										  handleConvertToPngAndSave={handleConvertToPngAndSave}
										  handleConvertToPngAndCopy={handleConvertToPngAndCopyToClipboard}

			/>
			<TimelineII units={plotUnit} shitRef={elementRef}/>
		</div>

	}

	if (page === "setting") {
		return <div>
			<NavigationMenuReactComponent page={page} setPage={setPage}/>
			<SettingReactComponent
				blocCtx={props.ctx}
				plugin={props.thisPlugin}
				setting={internalSetting}
				setSetting={setInternalSetting}

			/>
		</div>
	}
	return <>Wait, something go wrong</>
}
