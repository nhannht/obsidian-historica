import {TFile} from "obsidian";
import {Node, Point} from "unist";
import {ParsedResult} from "@nhannht/chrono-node";


export type HistoricaSettings = {
	blockId: string,
	header: string,
	footer: string,
	autoSave?: boolean,
	language?: string,
}

export type HistoricaPluginSettings = {
	dateDisplayFormat: string;
	dataDir: string;
	language: string;
};

export const DEFAULT_PLUGIN_SETTINGS: HistoricaPluginSettings = {
	dateDisplayFormat: "MMM D, YYYY",
	dataDir: "historica-data",
	language: "auto",
};

export type TimelineDocument = {
	settings:HistoricaSettings,
	units:TimelineEntry[],
	lastParsedAt?: number,
	parserVersion?: string,
}

export type Attachment = {
	id: string,
	path: string,
	caption?: string,
	relationship?: string,
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
	isDismissed?: boolean,
	annotation?: string,
	significance?: 1 | 2 | 3 | 4 | 5,
	isAnchor?: boolean,
	eraId?: string,
	precision?: "full" | "partial" | "approximate",
	manuallyTagged?: boolean,
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
