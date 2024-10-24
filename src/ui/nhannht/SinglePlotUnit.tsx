import HistoricaPlugin from "@/main";
import {
	Attachment,
	FormatDate,
	GenerateRandomId,
	GetAllFileInVault,
	JumpToSource,
	PlotUnitNg
} from "@/src/global";
import {useState} from "react";
import {AttachmentPlot, Content} from "@/src/ui/nhannht/TimelineGeneral";
import SinglePlotUnitNgEditor from "@/src/ui/nhannht/SinglePlotUnitEditor";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@/src/ui/shadcn/ContextMenu";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from "@/src/ui/shadcn/Command"
import {Check} from "lucide-react";
import {cn} from "@/lib/utils";
import {Badge} from "@/src/ui/shadcn/Badge"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/src/ui/shadcn/Tooltip"
export function SinglePlotUnit(props: {
	plugin: HistoricaPlugin,
	handleRemovePlotUnit: (id: string) => void,
	handleEditPlotUnit: (id: string, updatedUnit: PlotUnitNg) => void,
	handleAddPlotUnit: (index: number) => void,
	u: PlotUnitNg,
	index: number,
	handleMove: ((index: number, direction: string) => void),
	handleExpandSingle: ((id: string, isExpanded: boolean) => void)
}) {
	const [mode, setMode] = useState("normal")


	function handleModeChange(mode: string) {
		setMode(mode)
	}

	function handleMove(i: number, d: string) {
		if (props.handleMove) props.handleMove(i, d)
	}

	function handleAddAttachment(id: string, filePath: string) {
		let as: Attachment[] = props.u.attachments
		let newAtt: Attachment = {
			id: GenerateRandomId(),
			path: filePath
		}
		props.handleEditPlotUnit(id, {...props.u, attachments: [...as, newAtt]})
	}

	function handleRemoveAttachment(uId: string, path: string) {
		let as: Attachment[] = props.u.attachments
		let newAtts = as.filter((a) => a.path !== path)
		props.handleEditPlotUnit(uId, {...props.u, attachments: newAtts})

	}

	function handleChangePath(uId: string, newPath: string) {
		props.handleEditPlotUnit(uId, {...props.u, filePath: newPath})
	}


	if (mode === "normal") {
		return (
			<div
				key={props.u.id} className="relative pl-8 sm:pl-32 py-6 group ">
				<div className={"flex justify-around"}>
					<div

						title={"jump to position"}
						className="p-1 rounded-lg font-caveat font-medium text-2xl text-[color:--text-accent] mb-1 sm:mb-0">{props.u.parsedResultText}</div>

				</div>
				<div
					className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:px-px before:bg-[--background-modifier-hover] sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-2 after:h-2 after:bg-[--background-modifier-hover] after:border-4 after:box-content after:border-[--background-modifier-hover] after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5">

					<time
						className="sm:absolute left-0 translate-y-0.5 inline-flex items-center justify-center text-xs font-semibold uppercase w-20 h-6 mb-3 sm:mb-0 text-[color:--text-accent] bg-[--background-primary-alt] border rounded-full">{FormatDate(new Date(props.u.parsedResultUnixTime))}</time>
				</div>
				<ContextMenu>
					<ContextMenuTrigger>
						<div>
							<Content

								unit={props.u} plugin={props.plugin}
								handleExpandSingle={props.handleExpandSingle}

							/>
						</div>
					</ContextMenuTrigger>
					<ContextMenuContent>
						<ContextMenuItem
							onClick={() => {
								props.handleAddPlotUnit(props.index)
								handleModeChange("edit")
							}}
						>Add</ContextMenuItem>
						<ContextMenuItem
							onClick={() => props.handleRemovePlotUnit(props.u.id)}
						>Remove</ContextMenuItem>
						<ContextMenuItem onClick={() => {
							handleModeChange("edit")
						}}>Edit</ContextMenuItem>
						<ContextMenuItem
							onClick={() => {
								props.handleExpandSingle(props.u.id, !props.u.isExpanded)
							}}
						>Fold/Unfold</ContextMenuItem>
						<ContextMenuItem
							onClick={async () => {
								await JumpToSource(props.u.nodePos, props.u.filePath, props.u.sentence, props.plugin)
							}}
						>Jump to source</ContextMenuItem>
						<ContextMenuItem
							onClick={() => handleMove(props.index, "up")}
						>Move up</ContextMenuItem>
						<ContextMenuItem
							onClick={() => handleMove(props.index, "down")}
						>Move down</ContextMenuItem>
						<ContextMenuSub>
							<ContextMenuSubTrigger>Add attachment</ContextMenuSubTrigger>
							<ContextMenuSubContent>
								<Command className={"w-80"}>
									<CommandInput placeholder={"Search attachments"}></CommandInput>
									<CommandList >
										<CommandEmpty>No attachments</CommandEmpty>
										<CommandGroup title={""} content={""}>
											{GetAllFileInVault(props.plugin).map((f) => {
												return (
													<CommandItem
														key={f.path}
														value={f.path}
														onSelect={() => {
															if (props.u.attachments.some(a => a.path === f.path)) {
																handleRemoveAttachment(props.u.id, f.path)
															} else {
																handleAddAttachment(props.u.id, f.path)
															}

														}}

													>
														<Check
															className={cn("mr-2 h-4 w-4", props.u.attachments.some(a => a.path === f.path) ? "opacity-100" : "opacity-0")}/>

														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger asChild>
																	<div
																		className={"text-wrap w-full text-left"}>{f.path}</div>
																</TooltipTrigger>
																<TooltipContent>
																	<AttachmentPlot path={f.path} plugin={props.plugin}/>
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>


													</CommandItem>
												)
											})}
										</CommandGroup>
									</CommandList>
								</Command>
							</ContextMenuSubContent>
						</ContextMenuSub>
						<ContextMenuSub>
							<ContextMenuSubTrigger>Choose file source</ContextMenuSubTrigger>
							<ContextMenuSubContent>
								<Command className={"w-80"}>
									<CommandInput placeholder={"This is the file u will jump to if u want"}/>
									<CommandList>
										<CommandEmpty>No file</CommandEmpty>
										<CommandGroup>
											{GetAllFileInVault(props.plugin).map((f) => {
												return (
													<CommandItem
														key={f.path}
														value={f.path}
														onSelect={() => {
															handleChangePath(props.u.id, f.path)

														}}
													>
														<Check
															className={cn("mr-2 h-4 w-4", props.u.filePath === f.path ? "opacity-100" : "opacity-0")}/>
														{/*<AttachmentPlot className={"w-12"} key={i} path={f.path}*/}
														{/*				plugin={props.plugin}/>*/}
														<div className={"text-wrap w-full text-left"}>{f.path}</div>

													</CommandItem>
												)
											})}
										</CommandGroup>

									</CommandList>
								</Command>
							</ContextMenuSubContent>
						</ContextMenuSub>
					</ContextMenuContent>
				</ContextMenu>
				<div className={"flex  justify-end"}>
					<Badge
						onClick={async () => {
							await JumpToSource(props.u.nodePos, props.u.filePath, props.u.sentence, props.plugin)
						}}
						className={"p-2 text-sm hover:cursor-pointer hover:text-[--text-accent-hover] "}
						variant={"outline"}>{props.u.filePath}</Badge>
				</div>


			</div>)
	} else if (mode === "edit") {
		return <SinglePlotUnitNgEditor key={props.u.id} handleModeChange={handleModeChange} u={props.u}
									   handleEditPlotUnit={props.handleEditPlotUnit}/>
	} else {
		return <div key={props.u.id}></div>
	}

}
