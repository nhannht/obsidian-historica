import {MarkdownPostProcessorContext, Notice, TFile, TFolder} from "obsidian";
import HistoricaPlugin from "@/main";
import { HistoricaSettingNg, PlotUnitNg, UpdateBlockSetting} from "@/src/global";
import {PropsWithChildren, useEffect, useRef, useState} from "react";
import MarkdownProcesser from "@/src/MarkdownProcesser";
import {NavigationMenuLink, navigationMenuTriggerStyle} from "@/src/ui/shadcn/NavigationMenu"
import {cn} from "@/lib/utils";
import SettingReactComponent from "@/src/SettingReactComponent";
import {TimelineII} from "@/src/TimelineII";
import HistoricaExportHelper from "@/src/backgroundLogic/HistoricaExportHelper";
import {NavigationMenuReactComponent} from "@/src/NavigationMenuReactComponent";
import {TimelineI} from "@/src/TimelineI";
import {TimelineIII} from "@/src/TimelineIII";

//@ts-ignore
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


export function HistoricaBlockReactComponent(props: {
	src: string,
	ctx: MarkdownPostProcessorContext,
	plugin: HistoricaPlugin
	setting: HistoricaSettingNg
}) {

	const [plotUnits, setPlotUnits] = useState<PlotUnitNg[]>([])

	const elementRef = useRef<HTMLDivElement | null>(null);
	const exportHelper = new HistoricaExportHelper();


	useEffect(() => {
		const extractTimeline = async () => {
			if (internalSetting.cache){
				const blockId= internalSetting.blockId
				if (blockId != "-1" || blockId.trim().toLowerCase() != ""){
					const file = props.plugin.app.vault.getAbstractFileByPath(`historica-data/${blockId}.json`)
					if (file instanceof TFile){
						const fileContent = await props.plugin.app.vault.read(file)
						setPlotUnits(JSON.parse(fileContent))
					}
				}
			} else {
				const markdownProcesser = new MarkdownProcesser(props.plugin, props.setting)
				await markdownProcesser.parseAllFilesNg()
				// const allnodes = markdownProcesser.nodes
				// console.log(allnodes)
				const currentFile = props.plugin.app.workspace.getActiveFile()
				if (currentFile) {
					// let text = await props.plugin.app.vault.read(currentFile)
					const sentencesWithOffSet = await markdownProcesser.ExtractValidSentences(currentFile)
					// console.log(sentencesWithOffSet)
					let plotUnits = await markdownProcesser.GetPlotUnits(sentencesWithOffSet)
					internalSetting.custom_units.map(u => {
						plotUnits.push(u)
					})
					setPlotUnits(plotUnits)
				}
			}
			// console.log(allnodes)
		}
		extractTimeline().then()
	}, [])

	// useEffect(() => {
	// 	console.log(plotUnits)
	// }, [plotUnits]);

	const handleSaveCache = async () => {
		let historicaDataPath = props.plugin.app.vault.getAbstractFileByPath("historica-data")
		if (!historicaDataPath || !(historicaDataPath instanceof TFolder)){
			await props.plugin.app.vault.createFolder("historica-data")
			historicaDataPath = props.plugin.app.vault.getAbstractFileByPath("historica-data")
		}
		// console.log(historicaDataPath)

		const blockId = internalSetting.blockId
		const filePath = `${historicaDataPath!.path}/${blockId}.json`
		const fileExist = props.plugin.app.vault.getAbstractFileByPath(filePath) instanceof TFile
		if (!fileExist) {
			await props.plugin.app.vault.create(filePath, JSON.stringify(plotUnits))
		} else {
			await props.plugin.app.vault.modify(props.plugin.app.vault.getAbstractFileByPath(filePath) as TFile, JSON.stringify(plotUnits,null,2))
		}

		new Notice(`The cache was save to ${filePath}, and the cache option was turn on, if you don't want using cache, modify cache to false`,10000)


		await UpdateBlockSetting({...internalSetting,cache:true}, props.ctx, props.plugin)


	}

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

	const handleConvertToPngAndCopyToClipboard = async () => {
		if (elementRef.current) {
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

	const timelineRender = ()=>{
		if ([1,"default","1"].includes(internalSetting.style)){
			return <TimelineI units={plotUnits} shitRef={elementRef} plugin={props.plugin}  />
		} else if (["2",2].includes(internalSetting.style)){
			return <TimelineII units={plotUnits} shitRef={elementRef} plugin={props.plugin}/>
		} else if (["3",3].includes(internalSetting.style)){
			return <TimelineIII units={plotUnits} shitRef={elementRef} plugin={props.plugin}/>

		}
		return <></>
	}


	if (page === "timeline") {
		return <div className={"min-h-full"}>
			<NavigationMenuReactComponent page={page} setPage={setPage}
										  handleConvertToPngAndSave={handleConvertToPngAndSave}
										  handleConvertToPngAndCopy={handleConvertToPngAndCopyToClipboard}
										  handleSaveCache={handleSaveCache}
										  plugin={props.plugin}

			/>
			{timelineRender()}
		</div>

	}

	if (page === "setting") {
		return <div>
			<NavigationMenuReactComponent page={page} setPage={setPage} plugin={props.plugin}/>
			<SettingReactComponent
				handleSaveCache={handleSaveCache}
				blocCtx={props.ctx}
				plugin={props.plugin}
				setting={internalSetting}
				setSetting={setInternalSetting}

			/>
		</div>
	}
	return <>Wait, something go wrong</>
}
