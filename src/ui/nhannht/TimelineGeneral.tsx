import {JumpToSource, PlotUnitNg} from "@/src/global";
import HistoricaPlugin from "@/main";
import { useState} from "react";
import {TFile} from "obsidian";
import ImageFromPath from "@/src/ui/nhannht/ImageFromPath";
import ShortendableParagraph from "@/src/ShortendableParagraph";
import {cn} from "@/lib/utils";

export function AttachmentPlot(props: {
	path: string,
	plugin: HistoricaPlugin,
	className?: string,
	handleClick? : ()=>void

}) {
	const [file] = useState<TFile>(props.plugin.app.vault.getAbstractFileByPath(props.path) as TFile)
	if (["png", "jpeg", "jpg"].includes(file.extension)) {
		return <ImageFromPath
			handleClick={props.handleClick}
			className={cn(props.className)} width={"230"}
			path={props.path} plugin={props.plugin}/>
	} else {
		return <div>
			<div onClick={props.handleClick} className={cn("rounded-full bg-accent text-lg",props.className)}>{file.extension.toUpperCase()}</div>
		</div>
	}
}

export function Content(props: {
	unit: PlotUnitNg,
	plugin: HistoricaPlugin,
	handleExpandSingle: ((id: string, isExpanded: boolean) => void)

}) {
	// useEffect(() => {
	// 	console.log(props.unit)
	// }, []);

	return (
		<div>
			<ShortendableParagraph
				isExpanded={props.unit.isExpanded}
				className="text-[color:--text-normal]"
								   content={props.unit.sentence.replace(props.unit.parsedResultText, `<historica-mark class="text-[color:--text-accent-hover]">${props.unit.parsedResultText}</historica-mark>`)}/>

			<div className={"columns-2 md:columns-4 gap-4 space-y-4"}>
				{props.unit.attachments.map((a) => {
					return (
						<AttachmentPlot

							className={"hover:cursor-pointer"}
							handleClick={async ()=>{
								// console.log(a)
								await JumpToSource(undefined, a.path, undefined, props.plugin)

							}}


							path={a.path} plugin={props.plugin}/>
					)
				})}

			</div>
		</div>
	)


}
