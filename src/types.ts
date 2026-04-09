import {TFile} from "obsidian";
import {Node, Point} from "unist";
import {ParsedResult} from "chrono-node";


export type HistoricaSettingNg = {
	style: "default" | "1",
	pin_time: number, //unix timestamp
	blockId: string,
	header: string,
	footer: string
}

export type HistoricaFileData = {
	settings:HistoricaSettingNg,
	units:PlotUnitNg[]
}

export type Attachment = {
	id:string,
	path:string,
}

export type PlotUnitNg = {
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
export const DefaultSettings: HistoricaSettingNg = {
	style: "default",
	pin_time: 0,
	blockId: "-1",
	footer: "",
	header: ""
}
