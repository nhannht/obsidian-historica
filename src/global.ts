import {TFile} from "obsidian";
import {Node} from "unist";

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
	pathListFilter: String[]|"CurrentFile" |"All" ,
}

export type HistoricaSettingNg = {
	summary : boolean,
	style:"1"|"2"|"3"|"default",
	implicit_time:boolean,
	smart_theme: boolean,
	language: typeof HistoricaSupportLanguages[number],
	path_list: String[],
	include_files: String[],
	pin_time:String


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
