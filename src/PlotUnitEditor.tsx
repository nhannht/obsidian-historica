"use client"

import {useState} from "react"
import {Button} from "@/src/ui/shadcn/Button"
import {Input} from "@/src/ui/shadcn/Input"
import {Label} from "@/src/ui/shadcn/Label"
import {Textarea} from "@/src/ui/shadcn/Textarea"
import {Card, CardContent, CardHeader, CardTitle} from "@/src/ui/shadcn/Card"
import {Check, ChevronDown, ChevronsUpDown, ChevronUp, CircleHelp, PlusCircle, Trash2} from "lucide-react"
import {Attachment, GenerateRandomId, GetAllMarkdownFileInVault, PlotUnitNg} from "./global";
import {Popover, PopoverContent, PopoverTrigger} from "@/src/ui/shadcn/Popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem} from "@/src/ui/shadcn/Command"
import {cn} from "@/lib/utils";
import HistoricaPlugin from "@/main";
import {CommandList} from "cmdk";
import AttachmentEditor from "@/src/ui/nhannht/AttachmentEditor";



export default function PlotUnitNgEditor(
	props: {
		plotUnits: PlotUnitNg[],
		setPlotUnits: (p: PlotUnitNg[]) => void,
		plugin: HistoricaPlugin
	}
) {

	const [expandedCards, setExpandedCards] = useState<boolean[]>([])

	const addPlotUnit = () => {
		const newUnit: PlotUnitNg = {
			id: GenerateRandomId(),
			filePath: "",
			parsedResultText: "",
			sentence: "",
			parsedResultUnixTime: Date.now(),
			attachments: [],
			isExpanded:true
		}
		props.setPlotUnits([...props.plotUnits, newUnit])
		setExpandedCards([...expandedCards, true])
	}

	const removePlotUnit = (index: number) => {
		props.setPlotUnits(props.plotUnits.filter((_, i) => i !== index))
		setExpandedCards(expandedCards.filter((_, i) => i !== index))
	}

	const updatePlotUnit = (index: number, field: keyof PlotUnitNg, value: any) => {
		const updatedUnits = [...props.plotUnits]
		updatedUnits[index] = {...updatedUnits[index], [field]: value}
		props.setPlotUnits(updatedUnits)
	}

	const updateNodePos = (index: number, field: "start" | "end", axis: "column" | "line", value: number) => {
		const updatedUnits = [...props.plotUnits]
		if (!updatedUnits[index].nodePos) {
			updatedUnits[index].nodePos = {start: {column: 0, line: 0}, end: {column: 0, line: 0}}
		} else {
			//@ts-ignore
			updatedUnits[index].nodePos[field][axis] = value
		}
		props.setPlotUnits(updatedUnits)
	}

	const toggleCardExpansion = (index: number) => {
		const newExpandedCards = [...expandedCards]
		newExpandedCards[index] = !newExpandedCards[index]
		setExpandedCards(newExpandedCards)
	}

	const updateDate = (index: number, field: "year" | "month" | "day", value: string) => {
		const updatedUnits = [...props.plotUnits]
		const currentDate = new Date(updatedUnits[index].parsedResultUnixTime)

		if (field === "year") {
			currentDate.setFullYear(parseInt(value))
		} else if (field === "month") {
			currentDate.setMonth(parseInt(value) - 1) // Months are 0-indexed in JavaScript
		} else if (field === "day") {
			currentDate.setDate(parseInt(value))
		}

		updatedUnits[index].parsedResultUnixTime = currentDate.getTime()
		props.setPlotUnits(updatedUnits)
	}

	function setAttachments(pId:string, as:Attachment[]){
		let plotUnit = props.plotUnits.find(u => u.id === pId)
		if(plotUnit){
            plotUnit.attachments = as
            props.setPlotUnits([...props.plotUnits])
        }
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Custom Plot Units
				<CircleHelp className={"hover:cursor-pointer"} values={"Customize your addition plot unit here"}/></h1>
			{props.plotUnits.map((unit, index) => (
				<Card key={index} className="mb-4">
					<CardHeader>
						<CardTitle className="flex justify-between items-center">
							<div className="flex items-center space-x-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => toggleCardExpansion(index)}
									aria-expanded={expandedCards[index]}
									aria-label={expandedCards[index] ? "Collapse" : "Expand"}
								>
									{expandedCards[index] ? (
										<ChevronUp className="h-4 w-4"/>
									) : (
										<ChevronDown className="h-4 w-4"/>
									)}
								</Button>
								<div
								/>
								{unit.id}
							</div>
							<Button variant="destructive" size="icon" onClick={() => removePlotUnit(index)}>
								<Trash2 className="h-4 w-4"/>
								<span className="sr-only">Remove {unit.id}</span>
							</Button>
						</CardTitle>
					</CardHeader>
					{expandedCards[index] && (
						<CardContent>
							<div className="grid gap-4">
								<div className="flex flex-col space-y-1.5">
									<Label htmlFor={`filePath-${index}`}>File Path</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={false}
												className="w-full justify-between"
											>
												{unit.filePath || "Select file path..."}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-full p-0">
											<Command>
												<CommandInput placeholder="Search file path..."/>
												<CommandEmpty>No file path found.</CommandEmpty>
												<CommandGroup>
													<CommandList>
														{GetAllMarkdownFileInVault(props.plugin).map((file) => (
															<CommandItem
																key={file.path}
																onSelect={() => {
																	updatePlotUnit(index, "filePath", file.path)
																}}
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		unit.filePath === file.path ? "opacity-100" : "opacity-0"
																	)}
																/>
																{file.path}
															</CommandItem>
														))}


													</CommandList>
												</CommandGroup>
											</Command>
										</PopoverContent>
									</Popover>
								</div>
								{/*<div>*/}
								{/*	<Label htmlFor={`fileParent-${index}`}>File Parent</Label>*/}
								{/*	<Input*/}
								{/*		id={`fileParent-${index}`}*/}
								{/*		value={unit.fileParent || ""}*/}
								{/*		onChange={(e) => updatePlotUnit(index, "fileParent", e.target.value)}*/}
								{/*	/>*/}
								{/*</div>*/}
								<div>
									<Label htmlFor={`parsedResultText-${index}`}>Parsed Result Text</Label>
									<Textarea
										id={`parsedResultText-${index}`}
										value={unit.parsedResultText}
										onChange={(e) => updatePlotUnit(index, "parsedResultText", e.target.value)}
										required
									/>
									<CircleHelp className={"hover:cursor-pointer"}
												values={"The text will be highlighted, it must exist in the sentence"}/>
								</div>
								<div>
									<Label htmlFor={`sentence-${index}`}>Sentence</Label>
									<Input
										id={`sentence-${index}`}
										value={unit.sentence}
										onChange={(e) => updatePlotUnit(index, "sentence", e.target.value)}
										required
									/>
								</div>
								<div>
									<Label>Parsed Result Date</Label>
									<div className="grid grid-cols-3 gap-2">
										<div>
											<Label htmlFor={`year-${index}`}>Year</Label>
											<Input
												id={`year-${index}`}
												type="number"
												value={new Date(unit.parsedResultUnixTime).getFullYear()}
												onChange={(e) => updateDate(index, "year", e.target.value)}
												min="1970"
												max="2100"
												required
											/>
										</div>
										<div>
											<Label htmlFor={`month-${index}`}>Month</Label>
											<Input
												id={`month-${index}`}
												type="number"
												value={new Date(unit.parsedResultUnixTime).getMonth() + 1}
												onChange={(e) => updateDate(index, "month", e.target.value)}
												min="1"
												max="12"
												required
											/>
										</div>
										<div>
											<Label htmlFor={`day-${index}`}>Day</Label>
											<Input
												id={`day-${index}`}
												type="number"
												value={new Date(unit.parsedResultUnixTime).getDate()}
												onChange={(e) => updateDate(index, "day", e.target.value)}
												min="1"
												max="31"
												required
											/>
										</div>
									</div>
								</div>

									<div>
										<Label>Node Position</Label>
										<div className="grid grid-cols-2 gap-2">
											<div>
												<Label htmlFor={`nodePos-start-x-${index}`}>Start column</Label>
												<Input
													id={`nodePos-start-x-${index}`}
													type="number"
													value={unit.nodePos?.start.column || 0}
													onChange={(e) => updateNodePos(index, "start", "column", parseInt(e.target.value))}
												/>
											</div>
											<div>
												<Label htmlFor={`nodePos-start-y-${index}`}>Start line</Label>
												<Input
													id={`nodePos-start-y-${index}`}
													type="number"
													value={unit.nodePos?.start.line || 0}
													onChange={(e) => updateNodePos(index, "start", "line", parseInt(e.target.value))}
												/>
											</div>
											<div>
												<Label htmlFor={`nodePos-end-x-${index}`}>End column</Label>
												<Input
													id={`nodePos-end-x-${index}`}
													type="number"
													value={unit.nodePos?.end.column || 0}
													onChange={(e) => updateNodePos(index, "end", "column", parseInt(e.target.value))}
												/>
											</div>
											<div>
												<Label htmlFor={`nodePos-end-y-${index}`}>End line</Label>
												<Input
													id={`nodePos-end-y-${index}`}
													type="number"
													value={unit.nodePos?.end.line || 0}
													onChange={(e) => updateNodePos(index, "end", "line", parseInt(e.target.value))}
												/>
											</div>
										</div>
									</div>
								<AttachmentEditor plotUnitId={unit.id} attachments={unit.attachments} setAttachments={setAttachments} plugin={props.plugin}/>
								</div>
						</CardContent>
						)}
				</Card>
			))}
			<Button onClick={addPlotUnit} className="w-full">
				<PlusCircle className="mr-2 h-4 w-4"/> Add PlotUnit
			</Button>
		</div>
	)
}
