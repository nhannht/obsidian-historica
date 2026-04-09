import {MarkdownPostProcessorContext, MarkdownView, Notice, TFile} from "obsidian";
import {moment} from "./moment-fix";
import {Point} from "unist";
import HistoricaPlugin from "@/main";
import {
	HistoricaFileData,
	HistoricaSettingNg,
	TimeData
} from "./types";


export function FormatDate(t:TimeData): string {
	if (t.style === "unix"){
		const unixTime = parseInt(t.value)
		const m =  moment.unix(unixTime / 1000)
		return m.format("YYYY-MM-DD")

	} else if (t.style === "free"){
		return t.value
	}
	return "No date"

}

export async function JumpToSource(paragraphPos: { start: Point, end: Point }|undefined,
								   filePath: string,
								   text: string|undefined,
								   plugin: HistoricaPlugin) {

	const fileNeedToBeOpen =  plugin.app.vault.getAbstractFileByPath(filePath);
	const leaf = plugin.app.workspace.getLeaf(true);

	if (fileNeedToBeOpen instanceof TFile) {
		await leaf.openFile(fileNeedToBeOpen);


		if (paragraphPos && text){
			await leaf.setViewState({
				type: "markdown",
			});
			let view = leaf.view as MarkdownView;
			const editor = view.editor;
			const fileContent = await  plugin.app.vault.read(fileNeedToBeOpen)
			const paragraphText = fileContent.slice(paragraphPos.start.offset,paragraphPos.end.offset)

			let	start= paragraphPos.start.offset ? (paragraphPos.start.offset + paragraphText.indexOf(text)) : paragraphText.indexOf(text)
			let	end = start + text.length
			const editorPos = {
				start: editor.offsetToPos(start),
				end: editor.offsetToPos(end)
			}
			editor.setSelection(editorPos.start,editorPos.end)
			editor.scrollTo(editorPos.start.ch,editorPos.start.line)
		}

	}
}

export function GenerateRandomId() {
	const currentTime = moment().unix().toString();
	const randomNum = Math.floor(Math.random() * 1000000).toString(); // Generate a random number
	let hash = 0;
	const combinedString = currentTime + randomNum;
	for (let i = 0; i < combinedString.length; i++) {
		const char = combinedString.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash |= 0; // Convert to 32bit integer
	}
	return Math.abs(hash).toString();
}


export async function UpdateBlockSetting(settings: HistoricaSettingNg,
										 blockCtx: MarkdownPostProcessorContext,
										 plugin: HistoricaPlugin
) {
	const sourcePath = blockCtx.sourcePath
	//@ts-expect-error: el not define in blockCtx
	const elInfo = blockCtx.getSectionInfo(blockCtx.el)
	if (elInfo) {
		let linesFromFile = elInfo.text.split(/(.*?\n)/g)
		linesFromFile.forEach((e: string, i: number) => {
			if (e === "") linesFromFile.splice(i, 1)
		})
		// trim setting
		const newSetting = {
			blockId:settings.blockId
		}

		linesFromFile.splice(elInfo.lineStart + 1,
			elInfo.lineEnd - elInfo.lineStart - 1,
			JSON.stringify(newSetting, null,2), "\n")
		const newSettingsString = linesFromFile.join("")
		const file = plugin.app.vault.getAbstractFileByPath(sourcePath)
		if (file) {
			if (file instanceof TFile) {
				await plugin.app.vault.modify(file, newSettingsString)
			}
		}
	}

	// scroll back to the location of this block
	const currentFile = plugin.app.workspace.getActiveFile()
	if (currentFile instanceof TFile ) {
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
	return plugin.app.vault.getAllFolders()
}

export function GetAllMarkdownFileInVault(plugin: HistoricaPlugin) {
	return plugin.app.vault.getMarkdownFiles()
}

export function GetAllFileInVault(plugin: HistoricaPlugin) {
	return plugin.app.vault.getFiles()
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

export function sanitizeHtml(html: string): string {
	return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/\bon\w+\s*=/gi, "data-blocked=");
}

export function SelectRandomElement(r: any[]): any {
	if (r.length === 0) {
		return null;
	}
	const randomIndex = Math.floor(Math.random() * r.length);
	return r[randomIndex];
}



export function GetAllHistoricaDataFile(plugin: HistoricaPlugin) {
	return plugin.app.vault.getFiles().filter(f =>
		f.path.startsWith("historica-data") && f.extension === "json"
	)
}

export async  function ExportAsJSONToClipboard (data:HistoricaFileData){
	const json = JSON.stringify(data)
	if (json) {
		await navigator.clipboard.writeText(json)
		new Notice("JSON is copy to your clipboard")
	}
	else new Notice("Sorry the data in this timeline was corrupted to be exported")

}

export async function ExportAsMarkdownToClipboard(data:HistoricaFileData,plugin:HistoricaPlugin){
	let markdown:string[] = []
	markdown.push("---")
	const settings:HistoricaSettingNg = data.settings
	const blockId = settings.blockId
	markdown.push(`blockId: ${blockId}`)
	markdown.push("---")

	const units = data.units

	if (settings.header.trim() !== ""){
		markdown.push(`${settings.header}`)
	}
	markdown.push("---")

	units.map(u=>{
		markdown.push("### " + u.parsedResultText  )

		markdown.push(`${u.sentence}  `)
		markdown.push(`Source: [[${u.filePath}]]`)

		markdown.push(`Time: ${FormatDate(u.time)}`)

		u.attachments.length > 0 && markdown.push(`Attachments:`)
		u.attachments.length > 0 && u.attachments.map(a=>{
			const file =  plugin.app.vault.getAbstractFileByPath(a.path)
			if (file instanceof TFile) {
				if (["png","jpg","jpeg","svg"].includes(file.extension)){
					markdown.push(`- ![${file.name}](${a.path})`)
				} else {
					markdown.push(`- [${file.name}](${a.path})`)
				}
			}

		})
		markdown.push("---")

	})

	if (settings.footer.trim() !== "") markdown.push(`${settings.footer}`)
	markdown.push("---")

	try  {
		const result = markdown.join("\n\n")
        await navigator.clipboard.writeText(result)
        new Notice("Markdown is copy to your clipboard")
    } catch (error){
		new Notice(`We have error, please report it ${error}`)
	}

}
