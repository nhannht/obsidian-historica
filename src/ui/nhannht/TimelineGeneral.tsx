import {Attachment, PlotUnitNg, SelectRandomElement} from "@/src/global";
import HistoricaPlugin from "@/main";
import {useState} from "react";
import {TFile} from "obsidian";
import ImageFromPath from "@/src/ui/nhannht/ImageFromPath";
import ShortendableParagraph from "@/src/ShortendableParagraph";

export function AttachmentPlot(props: {
	attachment: Attachment,
	plugin: HistoricaPlugin
}) {
	const [file] = useState<TFile>(props.plugin.app.vault.getAbstractFileByPath(props.attachment.path) as TFile)
	if (["png", "jpeg", "jpg"].includes(file.extension)) {
		return <ImageFromPath height={SelectRandomElement([290, 170, 150, 350, 310, 330, 250])}
							  key={props.attachment.id} className={"w-full rounded-xl shadow"} width={"230"}
							  path={props.attachment.path} plugin={props.plugin}/>
	} else {
		return null
	}
}

export function Content(props: {
	unit: PlotUnitNg,
	plugin: HistoricaPlugin
}) {

	return (
		<div>
			<ShortendableParagraph className="text-[color:--text-accent-hover]]"
								   content={props.unit.sentence.replace(props.unit.parsedResultText, `<historica-mark class="text-[color:--text-accent-hover]">${props.unit.parsedResultText}</historica-mark>`)}/>

			<div className={"columns-2 md:columns-4 gap-4 space-y-4"}>
				{props.unit.attachments.map((a) => {
					return (
						<AttachmentPlot attachment={a} plugin={props.plugin}/>
					)
				})}

			</div>
		</div>
	)


}
