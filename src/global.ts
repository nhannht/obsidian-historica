import {MarkdownView, TFile} from "obsidian";
import {Node} from "unist";
import {ParsedResult} from "chrono-node";
import HistoricaPlugin from "@/main";

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
	style:1|2|3|"default"|"1"|"2"|"3"|"table"|"horizon",
	implicit_time:boolean,
	// smart_theme: boolean,
	language: typeof HistoricaSupportLanguages[number],
	path_option:  "all" | "current"| "custom",
	custom_path: string[], // only work when path_option is custom
	include_files: String[],
	pin_time:String,
	query: Query,
	sort: "asc"|"desc"



}

export type PlotUnit = {
	node:NodeAndTFile,
	text:string,
	parsedResult: ParsedResult,
	paragraph?: string,
}

export async function ExtractParagraph (s:SentenceWithOffset, p:HistoricaPlugin):Promise<string>{
	const fileContent = await p.app.vault.read(s.node.file)
	return  fileContent.slice(s.node.node.position?.start.offset,s.node.node.position?.end.offset)

}

export async function JumpToParagraphPosition(n: NodeAndTFile, p: HistoricaPlugin) {
	const fileNeedToBeOpen = p.app.vault.getAbstractFileByPath(n.file.path)
	const leaf = p.app.workspace.getLeaf(true)
	if (fileNeedToBeOpen instanceof TFile) {
		await leaf.openFile(fileNeedToBeOpen)
		await leaf.setViewState({
			type: "markdown",
		})
		// console.log(leaf.getViewState())

		let view = leaf.view as MarkdownView

		let startLine = n.node.position?.start.line ? n.node.position.start.line - 1 : 0
		let startCol = n.node.position?.start.column ? n.node.position.start.column - 1 : 0
		let endLine = n.node.position?.end.line ? n.node.position.end.line - 1 : 0
		let endCol = n.node.position?.end.column ? n.node.position.end.column - 1 : 0


		view.editor.setSelection({
			line: startLine,
			ch: startCol
		}, {
			line: endLine,
			ch: endCol
		})

		view.editor.focus()
		view.editor.scrollTo(0, startLine)

	}
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

export type NodeAndTFile = {
	node: Node,
	file: TFile
}

export interface SentenceWithOffset {
	node: NodeAndTFile;
	text: string;
	parsedResults: ParsedResult[]

}

// using for place holder when setting is missing
export const DefaultSettings: HistoricaSettingNg = {
	path_option: "current",
	custom_path: [],
	style: "default",
	language: "en",
	implicit_time: false,
	summary: false,
	smart_theme: true,
	include_files: [],
	pin_time: "",
	query: {}

}

export function FormatDate(date:Date): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(date)
}
