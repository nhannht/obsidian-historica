import {MarkdownPostProcessorContext, moment, Notice, TFile, TFolder} from "obsidian";
import HistoricaPlugin from "@/main";
import {
	GenerateRandomId,
	GetAllHistoricaDataFile,
	GetAllMarkdownFileInVault,
	HistoricaFileData,
	HistoricaSettingNg,
	PlotUnitNg,
	UpdateBlockSetting
} from "@/src/global";
import {useEffect, useRef, useState} from "react";
import MarkdownProcesser from "@/src/MarkdownProcesser";
// import {TimelineII} from "@/src/TimelineII";
import HistoricaExportHelper from "@/src/backgroundLogic/HistoricaExportHelper";
import {TimelineI} from "@/src/TimelineI";
// import {TimelineIII} from "@/src/TimelineIII";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/src/ui/shadcn/Command"
import iamlarvarandiknowit from "@/images/iamlarvarandiknowit.jpg"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger
} from "@/src/ui/shadcn/ContextMenu";

export function HistoricaMotherReactComponent(props: {
	src: string,
	ctx: MarkdownPostProcessorContext,
	plugin: HistoricaPlugin
	setting: HistoricaSettingNg
}) {

	const [plotUnits, setPlotUnits] = useState<PlotUnitNg[]>([])

	const elementRef = useRef<HTMLDivElement | null>(null);
	const exportHelper = new HistoricaExportHelper();
	const [internalSetting, setInternalSetting] =
		useState<HistoricaSettingNg>(structuredClone(props.setting))


	useEffect(() => {
		const extractTimeline = async () => {
			const blockId = internalSetting.blockId
			if (blockId != "-1") {
				const file = props.plugin.app.vault.getAbstractFileByPath(`historica-data/${blockId}.json`)
				if (file instanceof TFile) {
					const fileContent = await props.plugin.app.vault.read(file)
					let parseResult: HistoricaFileData = JSON.parse(fileContent)
					console.log(parseResult)
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
					const sentencesWithOffSet = await markdownProcesser.ExtractValidSentencesFromFile(currentFile, nodes, props.setting.language)
					// console.log(sentencesWithOffSet)
					let us = await markdownProcesser.GetPlotUnits(sentencesWithOffSet)
					units.push(...us)
				}


				setPlotUnits(units)

			}
			// console.log(allnodes)
		}
		extractTimeline().then()
	}, [])

	async function saveData(data:HistoricaFileData,filePath:string){



		const fileExist = props.plugin.app.vault.getAbstractFileByPath(filePath) instanceof TFile
		if (!fileExist) {
			await props.plugin.app.vault.create(filePath, JSON.stringify(data, null, 2))
		} else {
			await props.plugin.app.vault.modify(props.plugin.app.vault.getAbstractFileByPath(filePath) as TFile, JSON.stringify(data, null, 2))
		}
		// setInternalSetting({...internalSetting,blockId:blockId})
	}

	useEffect(() => {
		if (internalSetting.blockId !== "-1" && plotUnits.length !== 0){
			const data:HistoricaFileData = {
				settings: internalSetting,
                units: plotUnits
			}
			saveData(data,`historica-data/${internalSetting.blockId}.json`).then()
		}
	}, [internalSetting,plotUnits]);


	// useEffect(() => {
	// 	console.log(plotUnits)
	// }, [plotUnits]);

	const manualSave = async () => {
		let historicaDataPath = props.plugin.app.vault.getAbstractFileByPath("historica-data")
		if (!historicaDataPath || !(historicaDataPath instanceof TFolder)) {
			await props.plugin.app.vault.createFolder("historica-data")
			historicaDataPath = props.plugin.app.vault.getAbstractFileByPath("historica-data")
		}

		// console.log(historicaDataPath)

		const blockId = internalSetting.blockId === "-1" ? GenerateRandomId() : internalSetting.blockId
		const data:HistoricaFileData = {
			settings: {...internalSetting,blockId},
			units: plotUnits
		}
		await saveData(data,`${historicaDataPath!.path}/${blockId}.json`)
		new Notice(`The cache was save to ${historicaDataPath!.path}/${blockId}.json`, 10000)
		await UpdateBlockSetting({...internalSetting,blockId}, props.ctx, props.plugin)

	}

	const [mode] = useState("normal")


	const handleConvertToPngAndSave = async () => {
		// console.log("Hello")
		if (elementRef.current) {
			// console.log(elementRef.current)
			const imageData = await exportHelper.convertHTMLToImageData(elementRef.current);
			// Create a link element
			const link = document.createElement('a');
			link.href = imageData;
			link.download = 'historica-super-cool-exported-image.png';

			// Append to the body, click and remove it
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			new Notice("If everything go right, the image should be saved", 10000)
		} else {
			new Notice("Oops, things is not kool as I want, reported it please ", 10000)
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
				new Notice("Image will sit in your clipboard, bro!", 10000)
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

	function handleAddPlotUnit(index: number) {
		const id = GenerateRandomId()
		const newUnit: PlotUnitNg = {
			attachments: [],
			parsedResultText: "title",
			parsedResultUnixTime: moment().unix(),

			sentence: "main content",
			filePath: "",
			id: id,
			isExpanded: true,
			nodePos: {
				start: {line: 1, column: 1}, end: {line: 1, column: 1}
			}
		}
		let a = structuredClone(plotUnits.slice(0, index))
		let b = structuredClone(plotUnits.slice(index))
		setPlotUnits([...a, newUnit, ...b])

	}

	function handleIsExpandedLikeABro(id: string, isExpanded: boolean) {
		setPlotUnits((prevPlotUnits) => {
			return prevPlotUnits.map((unit) =>
				unit.id === id ? {...unit, isExpanded} : unit
			);
		});


	}

	function handleExpandAll(willExpand: boolean) {
		setPlotUnits((prevPlotUnits) => {
			return prevPlotUnits.map((unit) => ({
				...unit,
				isExpanded: willExpand
			}));
		});
	}


	function handleMovePlotUnit(index: number, direction: string) {
		setPlotUnits((prevUnits) => {
			const newUnits = [...prevUnits];
			if (direction === "up" && index > 0) {
				// Swap with the previous unit
				[newUnits[index], newUnits[index - 1]] = [newUnits[index - 1], newUnits[index]];
			} else if (direction === "down" && index < newUnits.length - 1) {
				// Swap with the next unit
				[newUnits[index], newUnits[index + 1]] = [newUnits[index + 1], newUnits[index]];
			}
			return newUnits;
		});
	}

	function handleSort(order: "asc" | "desc") {
		const sortedUnits = [...plotUnits].sort((a, b) => {
			return order === "asc"
				? a.parsedResultUnixTime - b.parsedResultUnixTime
				: b.parsedResultUnixTime - a.parsedResultUnixTime;
		});
		setPlotUnits(sortedUnits);
	}

	const timelineRender = () => {
		if (plotUnits.length > 0){
			if ([1, "default", "1"].includes(internalSetting.style)) {
				return <div className={"p-4"}>
					<TimelineI units={plotUnits} shitRef={elementRef} plugin={props.plugin}
							   handleRemovePlotUnit={handleRemovePlotUnit}
							   handleEditPlotUnit={handleEditPlotUnit}
							   handleAddPlotUnit={handleAddPlotUnit}
							   handleMove={handleMovePlotUnit}
							   handleExpandSingle={handleIsExpandedLikeABro}
					/>

				</div>
			}
		} else {
			return <div>
				<div>Hehe, this timeline is empty like the Void, right click on it and add a plot unit, Bro</div>
				<img className={"w-full"} alt={"iamlarvarandiknowit"} src={iamlarvarandiknowit}/>

			</div>
		}
		// } else if (["2", 2].includes(internalSetting.style)) {
		// 	return <TimelineII units={plotUnits} shitRef={elementRef} plugin={props.plugin}/>
		// } else if (["3", 3].includes(internalSetting.style)) {
		// 	return <TimelineIII units={plotUnits} shitRef={elementRef} plugin={props.plugin}/>
		//
		// }
		return <></>
	}

	function handleRemoveAll() {
		setPlotUnits([])
	}

	async function parseTimelineFromFile(path: string) {
		let units: PlotUnitNg[] = []
		const markdownProcesser = new MarkdownProcesser(props.plugin, props.setting)
		// const allnodes = markdownProcesser.nodes
		// console.log(allnodes)
		const file = props.plugin.app.vault.getAbstractFileByPath(path)
		if (file instanceof TFile) {
			// let text = await props.plugin.app.vault.read(currentFile)
			const nodes = await markdownProcesser.ParseFilesAndGetNodeData(file)
			const sentencesWithOffSet = await markdownProcesser.ExtractValidSentencesFromFile(file, nodes, props.setting.language)
			// console.log(sentencesWithOffSet)
			let us = await markdownProcesser.GetPlotUnits(sentencesWithOffSet)
			units.push(...us)
		}
		if (units.length === 0) new Notice("There is no unit can be parsed from this file", 10000)
		else new Notice(`There is ${units.length} was parsed from this file`, 10000)

		setPlotUnits([...units, ...plotUnits])
	}

	async function importFromOtherTimeline(path: string) {
		const file = props.plugin.app.vault.getAbstractFileByPath(path)
		if (file instanceof TFile) {
			const content = await props.plugin.app.vault.read(file)
			const data:HistoricaFileData = JSON.parse(content)
			if (data && data.units && data.units.length > 0) {
				const importedUnit = data.units
				new Notice(`There are ${importedUnit.length} imported to your timeline`,10000)
				setPlotUnits([...plotUnits, ...importedUnit])
			} else if (data.units && data.units.length === 0){
				new Notice("Oops, we don't have any unit being stored in this file")
			}
			else {
				new Notice("Sorry, the json in that file is corrupted, cannot import", 10000)
			}
		} else new Notice(`The file historica-data/${path} does not exist or not a normal json file`, 10000)

	}


	if (mode === "normal") {
		return (
			<ContextMenu>
				<ContextMenuTrigger>
					<div
						className={"min-h-full p-4"}>

						{timelineRender()}
					</div>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onClick={async () => {
						await manualSave()
					}}>Save</ContextMenuItem>
					<ContextMenuItem onClick={async () => {
						await handleConvertToPngAndSave()
					}}>Export as Image (png)</ContextMenuItem>
					<ContextMenuItem onClick={async () => {
						await handleConvertToPngAndCopyToClipboard()
					}}>Copy to clipboard</ContextMenuItem>
					<ContextMenuSub>
						<ContextMenuSubTrigger>Sort</ContextMenuSubTrigger>
						<ContextMenuSubContent>
							<ContextMenuItem onClick={() => handleSort("asc")}>Asc</ContextMenuItem>
							<ContextMenuItem onClick={() => handleSort("desc")}>Desc</ContextMenuItem>
						</ContextMenuSubContent>
					</ContextMenuSub>
					<ContextMenuItem onClick={() => handleExpandAll(true)}>Expand All</ContextMenuItem>
					<ContextMenuItem onClick={() => handleExpandAll(false)}>Fold All</ContextMenuItem>
					<ContextMenuItem onClick={handleRemoveAll}>Remove all</ContextMenuItem>
					<ContextMenuSub>
						<ContextMenuSubTrigger>Parse timeline from file</ContextMenuSubTrigger>
						<ContextMenuSubContent>
							<Command>
								<CommandInput placeholder={"search file path"}/>
								<CommandList>
									<CommandEmpty>No file was pick</CommandEmpty>
									<CommandGroup>
										{GetAllMarkdownFileInVault(props.plugin).map((f) => {
											return (
												<CommandItem
													key={f.path}
													value={f.path}
													onSelect={async (value) => {
														await parseTimelineFromFile(value)
													}}>
													{f.path}
												</CommandItem>
											)
										})}
									</CommandGroup>
								</CommandList>
							</Command>
						</ContextMenuSubContent>
					</ContextMenuSub>
					<ContextMenuSub>
						<ContextMenuSubTrigger>Import timeline units from antoher file</ContextMenuSubTrigger>

						<ContextMenuSubContent>
							<Command>
								<CommandInput placeholder={"pick file to import"}/>
								<CommandList>
									<CommandEmpty>No files was picked</CommandEmpty>
									<CommandGroup>
										{GetAllHistoricaDataFile(props.plugin).map(f => {
											return (
												<CommandItem
													key={f.path}
													value={f.path}
													onSelect={async (value) => {
														await importFromOtherTimeline(value)
													}}
												>{f.path}</CommandItem>
											)
										})}
									</CommandGroup>
								</CommandList>
							</Command>
						</ContextMenuSubContent>
					</ContextMenuSub>
					<ContextMenuItem
					onClick={()=> {

						handleAddPlotUnit(0)

					}}
					>Add in the first position</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
		)

	}

	// if (mode === "shitting") {
	// 	return <div>
	// 		<NavigationMenuReactComponent mode={mode} setMode={setMode}
	// 									  handleConvertToPngAndSave={handleConvertToPngAndSave}
	// 									  handleConvertToPngAndCopy={handleConvertToPngAndCopyToClipboard}
	//
	// 									  plugin={props.plugin}
	//
	// 		/>
	// 		<SettingReactComponent
	//
	// 			blocCtx={props.ctx}
	// 			plugin={props.plugin}
	// 			setting={internalSetting}
	// 			setSetting={setInternalSetting}
	//
	// 		/>
	// 	</div>
	// }
	return <div>Wait, something go wrong</div>
}
