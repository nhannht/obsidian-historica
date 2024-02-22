import {Plugin, TFile} from 'obsidian';
import {marked, Token} from "marked";
import {RecusiveGetToken} from "./function/RecusiveGetToken";
import * as fs from "fs";
import {GetTimelineDataFromDocumentArrayWithChrono} from "./function/GetTimelineDataFromDocumentArray";
import * as chrono from 'chrono-node';
import * as toml from "toml";
import {renderTimelineEntry} from "./function/renderTimelineEntry";

async function writeCurrentFileToCache() {
	const currentVaultPath = this.app.vault.adapter.basePath
	const cachePath = `${currentVaultPath}/.obsidian/historica-cache.dat`
	const currentFile = this.app.workspace.getActiveFile();
	if (!currentFile) {
		return
	}
	// console.log(currentFile.path)
	fs.writeFileSync(cachePath.trim(), currentFile.path, 'utf8')
}

async function getCurrentFile(): Promise<TFile> {
	let currentFile: TFile | null = this.app.workspace.getActiveFile();
	//@ts-ignore
	if (currentFile instanceof TFile) {

	} else {

		// @ts-ignore
		let currentFilePath = await readCurrentFileFromCache()
		if (currentFilePath) {

			const currentFileAbstract = this.app.vault.getAbstractFileByPath(currentFilePath)
			if (currentFileAbstract instanceof TFile) {
				currentFile = currentFileAbstract
			}
		}

	}
	// @ts-ignore
	return currentFile

}

async function readCurrentFileFromCache() {
	const currentVaultPath = this.app.vault.adapter.basePath
	if (!fs.existsSync(`${currentVaultPath}/.obsidian/historica-cache.json`)) {
		return
	}
	const cachePath = `${currentVaultPath}/.obsidian/historica-cache.json`
	return fs.readFileSync(cachePath, 'utf8')

}

/**
 * parse tfile to documents. documents is a global array that will be updated be side effect after each parse
 * @param file
 * @param documents
 */
async function parseTFileAndUpdateDocuments(file: TFile, documents: Token[]) {
	const lexerResult = marked.lexer(await this.app.vault.read(file));


	lexerResult.map((token) => {

		RecusiveGetToken(token, documents)
	})
	// filter token which is the smallest modulo


}

interface BlockConfig {
	style: number | 1,
	include_files?: string[] | [],
	// exclude_files?: string[]|[],
	// include_tags: string[],
	// exclude_tags: string[],


}

export default class HistoricaPlugin extends Plugin {


	async onload() {

		// set up wink nlp
		// const nlp = winkNLP(model);

		// set up custom chrono;
		const customChrono = chrono.casual.clone()
		customChrono.parsers.push({
			pattern: () => {
				return /\b(in|at|on|from|to)\s+(\d{4})\b/i
			},
			extract: (context, match) => {
				return {
					day: 1, month: 1, year: parseInt(match[2])
				}
			}
		})


		this.registerMarkdownCodeBlockProcessor("historica", async (source, el, ctx) => {

			// parse yaml in this block
			let blockConfig: BlockConfig = toml.parse(source)
			// console.log(Object.keys(blockConfig).length === 0)
			if (Object.keys(blockConfig).length === 0) {
				blockConfig = {
					style: 0,
					include_files: [],
					// exclude_files: []
				}
			}
			// console.log(blockConfig)

			if (![1, 2].includes(blockConfig.style)) {
				blockConfig.style = 1

			}

			let documentArray: Token[] = [];

			if (blockConfig.include_files!.length === 0) {
				const currentFile = await getCurrentFile()


				await parseTFileAndUpdateDocuments(currentFile, documentArray)


			} else {
				const allFiles = this.app.vault.getMarkdownFiles()

				const includeFiles = blockConfig.include_files || []
				for (let i = 0; i < includeFiles.length; i++) {
					const file = this.app.vault.getAbstractFileByPath(includeFiles[i])
					// console.log(file)
					if (file instanceof TFile) {
						await parseTFileAndUpdateDocuments(file, documentArray)
					}
				}
				// filter token which is the smallest modulo

			}
			documentArray = documentArray.filter((token) => {
				// @ts-ignore
				return token.tokens === undefined
			})


			// let timelineData = await GetTimelineDataFromDocumentArray(documentArray, nlp)
			let timelineData = await GetTimelineDataFromDocumentArrayWithChrono(documentArray, customChrono)


			const style = blockConfig.style || 1


			await renderTimelineEntry(timelineData, style,el)
			await writeCurrentFileToCache()
		})


		const ribbonIconEl = this.addRibbonIcon('heart', 'Historica icon', async (evt: MouseEvent) => {
			const allFiles = this.app.vault.getMarkdownFiles()
			// console.log(allFiles)

			console.log(this.app.vault.getAbstractFileByPath("go.md"))
		});


	}

	async onunload() {
		const currentFile = this.app.workspace.getActiveFile();
		await writeCurrentFileToCache()

	}

}



