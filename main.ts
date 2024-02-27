import {Plugin, TFile} from 'obsidian';
import {marked, Token} from "marked";
import {RecusiveGetToken} from "./src/RecusiveGetToken";
import {existsSync, readFileSync, writeFileSync} from "fs";
import {join} from 'path';
import {GetTimelineDataFromDocumentArrayWithChrono} from "./src/GetTimelineDataFromDocumentArray";
import {parse} from "toml";
import {renderTimelineEntry} from "./src/renderTimelineEntry";
import compromise from 'compromise';
import {setupCustomChrono} from "./src/setupCustomChrono";
import corpus from "./corpus.json"

async function resolveConfigFile(file:string){
    const currentVaultPath = this.app.vault.adapter.basePath
    const configDir = this.app.vault.configDir

    return join(currentVaultPath, configDir, file)

}

async function writeCurrentFileToCache() {


    // console.log(configDir)
    const cacheFileName = 'historica-cache.json'
    const cachePath = await resolveConfigFile(cacheFileName)
    // console.log(cachePath)
    // const cachePath = `${configDir}/historica-cache.dat`
    const currentFile = this.app.workspace.getActiveFile();
    if (!currentFile) {
        return
    }
    // console.log(currentFile.path)
    writeFileSync(cachePath.trim(), currentFile.path, 'utf8')
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
    const cacheFileName = 'historica-cache.json'
    const cachePath = await resolveConfigFile(cacheFileName)
    const currentVaultPath = this.app.vault.adapter.basePath
    if (!existsSync(cachePath)) {
        return
    }
    return readFileSync(cachePath, 'utf8')

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
        // console.log(corpus)


        // console.log(corpus)
        const customChrono = await setupCustomChrono()


        this.registerMarkdownCodeBlockProcessor("historica", async (source, el, ctx) => {

            // parse yaml in this block
            let blockConfig: BlockConfig = parse(source)
            // console.log(Object.keys(blockConfig).length === 0)
            if (Object.keys(blockConfig).length === 0) {
                blockConfig = {
                    style: 0,
                    include_files: [],
                    // exclude_files: []
                }
            }
            // console.log(blockConfig)

            if (![1, 2].includes(blockConfig.style) || !blockConfig.style) {
                blockConfig.style = 1

            }
            if (!blockConfig.include_files) {
                blockConfig.include_files = []
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
            // console.log(documentArray)


            let timelineData = await GetTimelineDataFromDocumentArrayWithChrono(
                documentArray,
                customChrono,
                compromise,
                corpus)


            const style = blockConfig.style || 1


            await renderTimelineEntry(timelineData, style, el)
            await writeCurrentFileToCache()
        })


        // const ribbonIconEl = this.addRibbonIcon('heart', 'Historica icon', async (evt: MouseEvent) => {
        //
        // 	console.log(compromise("human created their first civilization").match("#Noun #Verb #Noun    #Noun").text())
        // 	console.log(compromise("we are all smarter").json())
        //
        //
        //
        // });


    }

    async onunload() {
        const currentFile = this.app.workspace.getActiveFile();
        await writeCurrentFileToCache()

    }

}



