import {TimelineEntry} from "@/src/types";
import {JumpToSource} from "@/src/utils";
import HistoricaPlugin from "@/main";
import { useState} from "react";
import {TFile, Notice} from "obsidian";
import ImageFromPath from "@/src/ui/ImageFromPath";
import ShortendableParagraph from "@/src/ui/ShortendableParagraph";
import {cn} from "@/src/lib/utils";
import {truncate} from "@/src/utils";
import {FileExtBadge} from "@/src/ui/ManualBadge";

export function AttachmentPlot(props: {
	path: string,
	plugin: HistoricaPlugin,
	className?: string,
	handleClick? : ()=>void

}) {
	// getAbstractFileByPath returns null for a path that no longer resolves, and a
	// TFolder for a directory. Casting either to TFile made the next line throw and
	// took the whole timeline render down with it, so narrow instead and fall back
	// to the stored path when the attachment has been deleted or renamed.
	const [file] = useState<TFile | null>(() => {
		const found = props.plugin.app.vault.getAbstractFileByPath(props.path)
		return found instanceof TFile ? found : null
	})
	const fileName = props.path.split("/").pop() ?? props.path
	const extension = file ? file.extension : (fileName.includes(".") ? fileName.split(".").pop() ?? "" : "")
	const basename = file ? file.basename : fileName.replace(/\.[^.]*$/, "")
	if (["png", "jpeg", "jpg"].includes(extension)) {
		return <ImageFromPath
			handleClick={props.handleClick}
			className={cn(props.className)} width={"230"}
			path={props.path} plugin={props.plugin}/>
	} else {
		const name = truncate(basename, 18)
		return (
			<div
				onClick={props.handleClick}
				className={cn("flex items-center gap-1.5 px-2 py-1 rounded border border-[--background-modifier-border] bg-[--background-secondary] hover:bg-[--background-modifier-hover] cursor-pointer max-w-[160px]", props.className)}
			>
				<FileExtBadge ext={extension}/>
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
							handleClick={()=>{
								// console.log(a)
								JumpToSource(undefined, a.path, undefined, props.plugin).catch((error: unknown) => {
									console.error("Historica: failed to jump to source", error);
									new Notice("Historica: failed to jump to source");
								})

							}}


							path={a.path} plugin={props.plugin}/>
					)
				})}

			</div>
		</div>
	)


}
