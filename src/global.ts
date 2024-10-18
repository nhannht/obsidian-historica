import {MarkdownPostProcessorContext, MarkdownView, TFile, TFolder} from "obsidian";
import {Node, Point} from "unist";
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
	end: string,
	key:string,


}




export type HistoricaSettingNg = {
	summary : boolean,
	style:1|2|3|"default"|"1"|"2"|"3"|"table"|"horizon",
	implicit_time:boolean,
	// smart_theme: boolean,
	language: typeof HistoricaSupportLanguages[number],
	include_files: String[],
	pin_time:String,
	// query: QueryObject[],
	sort: "asc"|"desc",
	cache: boolean,
	blockId: string,
	custom_units: PlotUnitNg[]


}

export function GenerateBlockId(){
	const currentTime = new Date().getTime().toString();
	let hash = 0;
	for (let i = 0; i < currentTime.length; i++) {
		const char = currentTime.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash |= 0; // Convert to 32bit integer
	}
	return hash.toString();
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
	parsedResultUnixTime:number,
	attachments: Attachment[]

}



export async function JumpToTextInParagraph(paragraphPos: { start: Point, end: Point }|undefined, filePath: string, text: string, plugin: HistoricaPlugin) {
	// console.log(paragraphPos)

	const fileNeedToBeOpen = plugin.app.vault.getAbstractFileByPath(filePath);
	const leaf = plugin.app.workspace.getLeaf(true);

	if (fileNeedToBeOpen instanceof TFile && paragraphPos) {
		await leaf.openFile(fileNeedToBeOpen);
		await leaf.setViewState({
			type: "markdown",
		});

		let view = leaf.view as MarkdownView;
		const editor = view.editor;

		const fileContent = await  plugin.app.vault.read(fileNeedToBeOpen)
		const paragraphText = fileContent.slice(paragraphPos.start.offset,paragraphPos.end.offset)
		// console.log(paragraphText)

		let	start= paragraphPos.start.offset ? (paragraphPos.start.offset + paragraphText.indexOf(text)) : paragraphText.indexOf(text)
		// console.log(start)
		let	end = start + text.length
		// console.log(end)
		const editorPos = {
			start: editor.offsetToPos(start),
			end: editor.offsetToPos(end)
		}
		editor.setSelection(editorPos.start,editorPos.end)
		editor.scrollTo(editorPos.start.ch,editorPos.start.line)

	}
}

export function GenerateRandomId() {
	const currentTime = new Date().getTime().toString();
	const randomNum = Math.floor(Math.random() * 1000000).toString(); // Generate a random number
	let hash = 0;
	const combinedString = currentTime + randomNum;
	for (let i = 0; i < combinedString.length; i++) {
		const char = combinedString.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash |= 0; // Convert to 32bit integer
	}
	return hash.toString();
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
	path_option: "current",
	custom_path: [],
	style: "default",
	language: "en",
	implicit_time: false,
	summary: false,
	include_files: [],
	pin_time: "",
	// query: [],
	sort: "asc",
	blockId:"-1",
	cache: false,
	custom_units: []



}

export function FormatDate(date:Date): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(date)
}







// Example usage:

/**
 * Modify the block setting and ensure we will jump to the current block position. This function must be use via user action, avoid using via hook or auto api, because it will conflict with async
 * nature of obsidian
 * @param settings
 * @param blockCtx
 * @param plugin
 * @constructor
 */
export async function UpdateBlockSetting(settings: HistoricaSettingNg,
										 blockCtx: MarkdownPostProcessorContext,
										 plugin: HistoricaPlugin
) {
	const sourcePath = blockCtx.sourcePath
	//@ts-expect-error: el not define in blockCtx
	const elInfo = blockCtx.getSectionInfo(blockCtx.el)
	// console.log(elInfo)
	if (elInfo) {
		// console.log(elInfo.text)
		let linesFromFile = elInfo.text.split(/(.*?\n)/g)
		linesFromFile.forEach((e: string, i: number) => {
			if (e === "") linesFromFile.splice(i, 1)
		})
		// console.log(linesFromFile)
		linesFromFile.splice(elInfo.lineStart + 1,
			elInfo.lineEnd - elInfo.lineStart - 1,
			JSON.stringify(settings, null,2), "\n")
		// console.log(linesFromFile)
		const newSettingsString = linesFromFile.join("")
		const file = plugin.app.vault.getAbstractFileByPath(sourcePath)
		if (file) {
			if (file instanceof TFile) {
				await plugin.app.vault.modify(file, newSettingsString)
			}
		}
	}

	// scroll back to the location of this block, why we need it because Obsidian behaviour so stupid and keep scrolling around after we modify the file uisng api
	const currentFile = plugin.app.workspace.getActiveFile()
	if (currentFile instanceof TFile) {
		const leaf = plugin.app.workspace.getLeaf(false)
		await leaf.openFile(currentFile)
		await leaf.setViewState({
			type: "markdown",
		})
		let view = leaf.view as MarkdownView
		view.editor.setCursor({
			line: elInfo?.lineStart ? elInfo.lineEnd : 0,
			ch: 0,
		})
	}

}

export function GetAllDirInVault(plugin: HistoricaPlugin) {
	const fs = plugin.app.vault.getFiles()
	let dirs = new Set<TFolder>([])
	fs.map(f => {
		if (f instanceof TFolder) dirs.add(f)
	})
	return Array.from(dirs)

}

export function GetAllMarkdownFileInVault(plugin: HistoricaPlugin) {
	const fs = plugin.app.vault.getMarkdownFiles()
	let files = new Set<TFile>()
	fs.map(f => files.add(f))
	return Array.from(files)
}

export function GetAllFileInVault(plugin: HistoricaPlugin) {
	// console.log("Hello from get all file in vault")
	const fs = plugin.app.vault.getFiles()
	let results = new Set<TFile>([])
	fs.map(f=>{
		if (f instanceof TFile){
			results.add(f)
		}
	})
	// console.log(Array.from(results))


	return Array.from(results)

}

export async function ReadImage(plugin:HistoricaPlugin,filepath:string){
	const file = plugin.app.vault.getAbstractFileByPath(filepath)
	if (file instanceof  TFile){
		const content = await plugin.app.vault.readBinary(file)
		return content

	}
	return ""


}

export function GetFileExtensionFromPath(plugin:HistoricaPlugin,path:string){
	const file = plugin.app.vault.getAbstractFileByPath(path)
	if (file instanceof TFile) return file.extension
	else return "md"
}

export function SelectRandomElement(r: any[]): any {
	if (r.length === 0) {
		return null; // or throw an error if you prefer
	}
	const randomIndex = Math.floor(Math.random() * r.length);
	return r[randomIndex];
}
