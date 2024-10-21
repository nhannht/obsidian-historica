import HistoricaPlugin from "@/main";
import {FormatDate, JumpToTextInParagraph, PlotUnitNg} from "@/src/global";
import {useState} from "react";
import {Content} from "@/src/ui/nhannht/TimelineGeneral";
import SinglePlotUnitNgEditor from "@/src/ui/nhannht/SinglePlotUnitEditor";
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger} from "@/src/ui/shadcn/ContextMenu";
export function SinglePlotUnit(props: {
	plugin: HistoricaPlugin,
	handleRemovePlotUnit: (id: string) => void,
	handleEditPlotUnit: (id: string, updatedUnit: PlotUnitNg) => void
	handleAddPlotUnit: (index: number) => void,
	u: PlotUnitNg,
	index: number
}) {
	const [mode, setMode] = useState("normal")
	const [isExpanded,setIsExpanded] = useState(true)

	function handleModeChange(mode: string) {
		setMode(mode)
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

					{/*<button onClick={()=>props.handleEditPlotUnit(u.id)}>Edit</button>*/}
					<time
						className="sm:absolute left-0 translate-y-0.5 inline-flex items-center justify-center text-xs font-semibold uppercase w-20 h-6 mb-3 sm:mb-0 text-[color:--text-accent] bg-[--background-primary-alt] border rounded-full">{FormatDate(new Date(props.u.parsedResultUnixTime))}</time>
				</div>
				<ContextMenu>
					<ContextMenuTrigger>
						<div>
							<Content
								isExpanded={isExpanded}
								setIsExpanded={setIsExpanded}
								unit={props.u} plugin={props.plugin}/>
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
							onClick={()=>{
								setIsExpanded(!isExpanded)
							}}
						>Fold/Unfold</ContextMenuItem>
						<ContextMenuItem
						onClick={async ()=>{
							await JumpToTextInParagraph(props.u.nodePos, props.u.filePath, props.u.sentence, props.plugin)
						}}
						>Jump to source</ContextMenuItem>
					</ContextMenuContent>
				</ContextMenu>


			</div>)
	} else if (mode === "edit") {
		return <SinglePlotUnitNgEditor key={props.u.id} handleModeChange={handleModeChange} u={props.u}
									   handleEditPlotUnit={props.handleEditPlotUnit}/>
	} else {
		return <div key={props.u.id}></div>
	}

}
