import {MarkdownPostProcessorContext, MarkdownView, Notice, TFile} from "obsidian";
import {moment} from "./moment-fix";
import {Point} from "unist";
import HistoricaPlugin from "@/main";
import {
	TimelineDocument,
	HistoricaSettings,
	TimeData
} from "./types";
import {HISTORICA_DATA_DIR} from "./data/TimelineDataManager";


export function formatDate(t:TimeData): string {
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

export function generateRandomId() {
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


// Deterministic entry ID: hash of sentence text + occurrence index.
// Same sentence appearing N times gets indices 0, 1, 2... so annotations
// survive re-parses as long as the sentence text is unchanged.
export function sentenceHash(sentence: string): string {
	let hash = 0;
	for (let i = 0; i < sentence.length; i++) {
		const char = sentence.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash |= 0;
	}
	return Math.abs(hash).toString();
}

export function deterministicEntryId(sentence: string, occurrenceIndex: number): string {
	return `${sentenceHash(sentence)}:${occurrenceIndex}`;
}

// Returns true if an ID was generated deterministically (contains ":").
export function isDeterministicId(id: string): boolean {
	return id.includes(":");
}


export async function UpdateBlockSetting(settings: HistoricaSettings,
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
		// Write blockId with a self-documenting comment so users know what the number means
		linesFromFile.splice(elInfo.lineStart + 1,
			elInfo.lineEnd - elInfo.lineStart - 1,
			"# Block ID — links this block to its saved timeline data. Do not edit.\n" + settings.blockId, "\n")
		const newSettingsString = linesFromFile.join("")
		const file = plugin.app.vault.getAbstractFileByPath(sourcePath)
		if (file) {
			if (file instanceof TFile) {
				await plugin.app.vault.modify(file, newSettingsString)
			}
		}
	}

	// Move cursor before the code block so Live Preview renders the preview
	// (cursor inside a code block shows raw source instead)
	const leaf = plugin.app.workspace.getMostRecentLeaf()
	if (leaf && elInfo) {
		const view = leaf.view as MarkdownView
		if (view?.editor) {
			const targetLine = elInfo.lineStart > 0 ? elInfo.lineStart - 1 : 0
			view.editor.setCursor({line: targetLine, ch: 0})
		}
	}

}

export function GetAllDirInVault(plugin: HistoricaPlugin) {
	return plugin.app.vault.getAllFolders()
}

export function getAllMarkdownFileInVault(plugin: HistoricaPlugin) {
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
		f.path.startsWith(HISTORICA_DATA_DIR) && f.extension === "json"
	)
}

function extractBlockIdFromSource(source: string): string {
	const trimmed = source.trim()
	if (trimmed === "") return "-1"
	if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) return trimmed
	try {
		const parsed = JSON.parse(trimmed)
		if (typeof parsed === "object" && parsed !== null && parsed.blockId && parsed.blockId.trim() !== "-1") {
			return parsed.blockId.trim()
		}
	} catch { /* not JSON */ }
	return "-1"
}

export async function findOrphanedDataFiles(plugin: HistoricaPlugin): Promise<TFile[]> {
	const dataFiles = plugin.app.vault.getFiles().filter(f =>
		f.path.startsWith(HISTORICA_DATA_DIR + "/") && (f.extension === "md" || f.extension === "json")
	)
	if (dataFiles.length === 0) return []

	const activeBlockIds = new Set<string>()
	const codeBlockRe = /```historica\n([\s\S]*?)```/g

	for (const mdFile of plugin.app.vault.getMarkdownFiles()) {
		const content = await plugin.app.vault.cachedRead(mdFile)
		let match: RegExpExecArray | null
		codeBlockRe.lastIndex = 0
		while ((match = codeBlockRe.exec(content)) !== null) {
			const blockId = extractBlockIdFromSource(match[1])
			if (blockId !== "-1") activeBlockIds.add(blockId)
		}
	}

	return dataFiles.filter(f => !activeBlockIds.has(f.basename))
}


async function copyToClipboard(text: string, label: string) {
	try {
		await navigator.clipboard.writeText(text)
		new Notice(`${label} copied to clipboard`)
	} catch (error) {
		new Notice(`Export failed: ${error}`)
	}
}
export async function ExportAsJSONToClipboard(data: TimelineDocument) {
	const json = JSON.stringify(data)
	if (json) await copyToClipboard(json, "JSON")
	else new Notice("Sorry the data in this timeline was corrupted to be exported")
}

export async function ExportAsMarkdownToClipboard(data: TimelineDocument, plugin: HistoricaPlugin) {
	let markdown: string[] = []
	markdown.push("---")
	const settings: HistoricaSettings = data.settings
	const blockId = settings.blockId
	markdown.push(`blockId: ${blockId}`)
	markdown.push("---")

	const units = data.units

	if (settings.header.trim() !== "") {
		markdown.push(`${settings.header}`)
	}
	markdown.push("---")

	units.map(u => {
		markdown.push("### " + u.parsedResultText)
		markdown.push(`${u.sentence}  `)
		markdown.push(`Source: [[${u.filePath}]]`)
		markdown.push(`Time: ${formatDate(u.time)}`)

		u.attachments.length > 0 && markdown.push(`Attachments:`)
		u.attachments.length > 0 && u.attachments.map(a => {
			const file = plugin.app.vault.getAbstractFileByPath(a.path)
			if (file instanceof TFile) {
				if (["png", "jpg", "jpeg", "svg"].includes(file.extension)) {
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

	await copyToClipboard(markdown.join("\n\n"), "Markdown")
}

export async function ExportAsPlainTextToClipboard(data: TimelineDocument) {
	const lines: string[] = []
	for (const u of data.units) {
		lines.push(`${formatDate(u.time)}  ${u.parsedResultText}`)
		lines.push(u.sentence)
		lines.push("")
	}
	await copyToClipboard(lines.join("\n").trim(), "Plain text")
}

export async function exportTimelineAsPng(element: HTMLElement, mode: "save" | "clipboard") {
	const {toPng} = await import("html-to-image");
	const imageData = await toPng(element);
	if (mode === "save") {
		const link = document.createElement("a");
		link.href = imageData;
		link.download = "historica-timeline.png";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		new Notice("Image saved", 10000);
	} else {
		const response = await fetch(imageData);
		const blob = await response.blob();
		try {
			await navigator.clipboard.write([new ClipboardItem({[blob.type]: blob})]);
			new Notice("Image copied to clipboard", 10000);
		} catch (err) {
			console.error("Failed to copy image to clipboard:", err);
		}
	}
}

export function notePathToTitle(notePath: string): string {
	if (!notePath) return "";
	const base = notePath.split("/").pop() ?? "";
	return base.endsWith(".md") ? base.slice(0, -3) : base;
}

export function getNoteTags(plugin: HistoricaPlugin, notePath: string): string[] {
	const cache = plugin.app.metadataCache.getCache(notePath);
	const front: string[] = cache?.frontmatter?.tags ?? [];
	const inline = (cache?.tags ?? []).map((t: { tag: string }) => t.tag);
	return [...front, ...inline];
}
