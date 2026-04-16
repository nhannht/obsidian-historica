import {TimelineEntry} from "@/src/types";
import {JumpToSource} from "@/src/utils";
import HistoricaPlugin from "@/main";
import { useState} from "react";
import {TFile} from "obsidian";
import ImageFromPath from "@/src/ui/ImageFromPath";
import ShortendableParagraph from "@/src/ui/ShortendableParagraph";
import {cn} from "@/src/lib/utils";
import {truncate} from "@/src/utils";

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
		const name = truncate(file.basename, 18)
		return (
			<div
				onClick={props.handleClick}
				className={cn("flex items-center gap-1.5 px-2 py-1 rounded border border-[--background-modifier-border] bg-[--background-secondary] hover:bg-[--background-modifier-hover] cursor-pointer max-w-[160px]", props.className)}
			>
				<span className="shrink-0 px-1 py-0.5 text-[10px] font-mono rounded bg-[--interactive-accent]/20 text-[color:--text-accent] uppercase">
					{file.extension}
				</span>
				<span className="text-xs text-[color:--text-muted] truncate">{name}</span>
			</div>
		)
	}
}

export function Content(props: {
	unit: TimelineEntry,
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

			<div className={"flex flex-wrap gap-2 max-h-48 overflow-y-auto"}>
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
