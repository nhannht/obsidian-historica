import {TFile} from "obsidian";
import {Node} from "unist";
import {ParsedResult} from "chrono-node";

export const HistoricaSupportLanguages = [
	"en",
	"ja",
	"fr",
	"de",
	"nl",
	"ru",
	"uk",
	"pt",
	"zh.hant",
]

export interface HistoricaSetting {
	latestFile: string
	showUseFulInformation: boolean
	defaultStyle: string,
	showRelativeTime: boolean,
	usingSmartTheme: boolean,
	language: typeof HistoricaSupportLanguages[number],
	pathListFilter: String[]|"Current" |"All" ,
}

export type QueryObject = {
	start: string,
	end: string

}

export type Query = {
	[key:string]: QueryObject
}

export type HistoricaSettingNg = {
	summary : boolean,
	style:1|2|3|"default"|"1"|"2"|"3",
	implicit_time:boolean,
	smart_theme: boolean,
	language: typeof HistoricaSupportLanguages[number],
	path_list: String[]| "All" | "Current",
	include_files: String[],
	pin_time:String,
	query: Query



}

export function HistoricaSettingNgTypeGuard(s: any): s is HistoricaSettingNg {
	return (
		typeof s === "object" &&
		s !== null &&
		typeof s.summaryData === "boolean" &&
		(s.defaultStyle === "1" || s.defaultStyle === "2" || s.defaultStyle === "3" || s.defaultStyle === "default") &&
		typeof s.showRelativeTime === "boolean" &&
		typeof s.usingSmartTheme === "boolean" &&
		typeof s.language === "string" && // Assuming language is a string, you might want to check against the actual supported languages
		Array.isArray(s.pathListFilter) &&
		s.pathListFilter.every((item: any) => typeof item === "string")
	);
}

export type NodeFromParseTree = {
	node: Node,
	file: TFile
}

export interface SentenceWithOffset {
	node: NodeFromParseTree;
	text: string;
	parsedResult: ParsedResult[]

}

// using for place holder when setting is missing
export const DefaultSettings: HistoricaSettingNg = {
	path_list: ["CurrentFile"],
	style: "default",
	language: "en",
	implicit_time: false,
	summary: false,
	smart_theme: true,
	include_files: [],
	pin_time: "",
	query: {}

}
