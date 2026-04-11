import {TFile} from "obsidian";
import {Node, Point} from "unist";
import {ParsedResult} from "chrono-node";


export type HistoricaSettings = {
	blockId: string,
	header: string,
	footer: string,
	autoSave?: boolean,
}

export type TimelineDocument = {
	settings:HistoricaSettings,
	units:TimelineEntry[]
}

export type Attachment = {
	id:string,
	path:string,
}

export type TimelineEntry = {
	id:string,
	nodePos?: {
		start:Point,
		end:Point
	},
	filePath: string,
	fileParent?:string,
	parsedResultText: string,
	sentence:string,
	time:TimeData,
	attachments: Attachment[],
	isExpanded: boolean,
	isHidden?: boolean,
	annotation?: string,
}

export type TimeData =  {
	style: "unix"|"free",
	value: string
}

export type NodeAndTFile = {
	node: Node,
	file: TFile
}

export interface SentenceWithOffset {
	node: NodeAndTFile;
	text: string;
	parsedResults: ParsedResult[]

}

// this default setting will be using for global settings. Or if some settings is missing in the block
export const DefaultSettings: HistoricaSettings = {
	blockId: "-1",
	footer: "",
	header: ""
}
