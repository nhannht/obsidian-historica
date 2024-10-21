import {MarkdownPostProcessorContext, Notice, TFile, TFolder} from "obsidian";
import HistoricaPlugin from "@/main";
import {GenerateRandomId, HistoricaFileData, HistoricaSettingNg, PlotUnitNg, UpdateBlockSetting} from "@/src/global";
import {useEffect, useRef, useState} from "react";
import MarkdownProcesser from "@/src/MarkdownProcesser";
import SettingReactComponent from "@/src/SettingReactComponent";
import {TimelineII} from "@/src/TimelineII";
import HistoricaExportHelper from "@/src/backgroundLogic/HistoricaExportHelper";
import {NavigationMenuReactComponent} from "@/src/NavigationMenuReactComponent";
import {TimelineI} from "@/src/TimelineI";
import {TimelineIII} from "@/src/TimelineIII";

export function HistoricaMotherReactComponent(props: {
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
			const blockId = internalSetting.blockId
			// console.log(internalSetting.blockId)
			if (blockId != "-1") {
				const file = props.plugin.app.vault.getAbstractFileByPath(`historica-data/${blockId}.json`)
				if (file instanceof TFile) {
					const fileContent = await props.plugin.app.vault.read(file)
					let parseResult: HistoricaFileData = JSON.parse(fileContent)
					if (parseResult) {
						setInternalSetting(parseResult.settings)
						setPlotUnits(parseResult.units)

					}
				}
			} else {
				// console.log("Hello")
				let units: PlotUnitNg[] = []
				const markdownProcesser = new MarkdownProcesser(props.plugin, props.setting)
				// const allnodes = markdownProcesser.nodes
				// console.log(allnodes)
				const currentFile = props.plugin.app.workspace.getActiveFile()
				if (currentFile instanceof TFile) {
					// let text = await props.plugin.app.vault.read(currentFile)
					const nodes = await markdownProcesser.ParseFilesAndGetNodeData(currentFile)
					const sentencesWithOffSet = await markdownProcesser.ExtractValidSentencesFromFile(currentFile, nodes)
					// console.log(sentencesWithOffSet)
					let plotUnits = await markdownProcesser.GetPlotUnits(sentencesWithOffSet)
					units.push(...plotUnits)
				}

				// console.log(units)

				setPlotUnits(units)

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
		if (!historicaDataPath || !(historicaDataPath instanceof TFolder)) {
			await props.plugin.app.vault.createFolder("historica-data")
			historicaDataPath = props.plugin.app.vault.getAbstractFileByPath("historica-data")
		}
		// console.log(historicaDataPath)

		const blockId = internalSetting.blockId === "-1" ? GenerateRandomId() : internalSetting.blockId
		internalSetting.blockId = blockId
		setInternalSetting(internalSetting)
		let data:HistoricaFileData = {
			settings: internalSetting,
			units:plotUnits
		}
		const filePath = `${historicaDataPath!.path}/${blockId}.json`
		const fileExist = props.plugin.app.vault.getAbstractFileByPath(filePath) instanceof TFile
		if (!fileExist) {
			await props.plugin.app.vault.create(filePath, JSON.stringify(data, null, 2))
		} else {
			await props.plugin.app.vault.modify(props.plugin.app.vault.getAbstractFileByPath(filePath) as TFile, JSON.stringify(data, null, 2))
		}

		new Notice(`The cache was save to ${filePath}`, 10000)

		await UpdateBlockSetting(internalSetting,props.ctx,props.plugin)


	}

	const [internalSetting, setInternalSetting] =
		useState<HistoricaSettingNg>(structuredClone(props.setting))
	const [mode, setMode] = useState("normal")
	function handleChangeModeLikeABro(mode:string){
		setMode(mode)
	}

	const handleConvertToPngAndSave = async () => {
		console.log("Hello")
		if (elementRef.current) {
			console.log(elementRef.current)
			const imageData = await exportHelper.convertHTMLToImageData(elementRef.current);
			// Create a link element
			const link = document.createElement('a');
			link.href = imageData;
			link.download = 'historica-super-cool-exported-image.png';

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

	function handleRemovePlotUnit(id: string) {
		setPlotUnits((prevPlotUnits) => {
			// Create a new array excluding the plot unit at the specified index
			return prevPlotUnits.filter((u) => u.id !== id);
		});
	}

	function handleEditPlotUnit(id: string, updatedUnit: PlotUnitNg) {
		setPlotUnits((prevPlotUnits) => {
			// Create a new array with the updated plot unit where the id matches
			return prevPlotUnits.map((unit) => (unit.id === id ? updatedUnit : unit));
		});
	}

	function handleAddPlotUnit(index:number){
		const id = GenerateRandomId()
		const newUnit:PlotUnitNg = {
			attachments:[],
			parsedResultText:"wait, what",
			parsedResultUnixTime:new Date().getTime(),

			sentence:"mother fucker",
			filePath:"okie.md",
			id:id,
		}
		let a = structuredClone(plotUnits.slice(0,index))
		let b = structuredClone(plotUnits.slice(index))
		setPlotUnits([...a,newUnit,...b])

	}

	const timelineRender = () => {
		if ([1, "default", "1"].includes(internalSetting.style)) {
			return <div className={"p-4"}>
				<TimelineI units={plotUnits} shitRef={elementRef} plugin={props.plugin}
						   handleRemovePlotUnit={handleRemovePlotUnit}
						   handleEditPlotUnit={handleEditPlotUnit}
						   handleAddPlotUnit={handleAddPlotUnit}
				/>

			</div>
		} else if (["2", 2].includes(internalSetting.style)) {
			return <TimelineII units={plotUnits} shitRef={elementRef} plugin={props.plugin}/>
		} else if (["3", 3].includes(internalSetting.style)) {
			return <TimelineIII units={plotUnits} shitRef={elementRef} plugin={props.plugin}/>

		}
		return <></>
	}


	if (mode === "normal") {
		return <div
			onContextMenu={(e)=>{
				e.preventDefault()
				handleChangeModeLikeABro("shitting")
			}}
			className={"min-h-full"}>
			<button onClick={handleSaveCache}>Save the plot</button>

			{timelineRender()}
		</div>

	}

	if (mode === "shitting") {
		return <div>
			<NavigationMenuReactComponent mode={mode} setMode={setMode}
										  handleConvertToPngAndSave={handleConvertToPngAndSave}
										  handleConvertToPngAndCopy={handleConvertToPngAndCopyToClipboard}

										  plugin={props.plugin}

			/>
			<SettingReactComponent

				blocCtx={props.ctx}
				plugin={props.plugin}
				setting={internalSetting}
				setSetting={setInternalSetting}

			/>
		</div>
	}
	return <>Wait, something go wrong</>
}
