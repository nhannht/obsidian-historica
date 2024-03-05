import {Plugin, TFile} from 'obsidian';
import {marked, Token} from "marked";
import {RecusiveGetToken} from "./src/RecusiveGetToken";
import {GetTimelineDataFromDocumentArrayWithChrono} from "./src/GetTimelineDataFromDocumentArray";
import {parse} from "toml";
import {renderTimelineEntry} from "./src/renderTimelineEntry";
import compromise from 'compromise';
import {setupCustomChrono} from "./src/setupCustomChrono";
import corpus from "./corpus.json"


/**
 * get the current file. if the current file is not a TFile, get the latest file from plugin data.Why this function exist, because most time the plugin load faster than the buffer when fist start Obsidian, so getActiveFile - standard way to get current file in obsidian still not being loaded
 * @param currentPlugin
 */
async function getCurrentFile(currentPlugin:Plugin): Promise<TFile> {
    let currentFile: TFile | null = currentPlugin.app.workspace.getActiveFile();
    //@ts-ignore
    if (currentFile instanceof TFile) {

    } else {

        // @ts-ignore

        let data = await currentPlugin.loadData()

        if (data.latestFile) {

            const currentFileAbstract = currentPlugin.app.vault.getAbstractFileByPath(data.latestFile)
            if (currentFileAbstract instanceof TFile) {
                currentFile = currentFileAbstract
            }
        }

    }
    // @ts-ignore
    return currentFile

}

/**
 * write the latest file to data. in case data never exist before, create a new data object
 * @param currentPlugin
 * @param file
 */
async function writeLatestFileToData(currentPlugin: Plugin,file:TFile){
    let data = await currentPlugin.loadData()
    if (!data){
        data = {latestFile: file.path}

    }
    data.latestFile = file.path
    await currentPlugin.saveData(data)

}


/**
 * parse tfile to documents. documents is a global array that will be updated be side effect after each parse
 * @param file
 * @param documents
 */
async function parseTFileAndUpdateDocuments(currentPlugin: Plugin, file: TFile | null, documents: Token[]) {
    if (!file) {
        return
    }
    const lexerResult = marked.lexer(await currentPlugin.app.vault.read(file));


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


// async function writeCurrentFileToData() {
//     const currentFile = await getCurrentFile()
//     console.log(await this.loadData())
//     if (currentFile) {
//         let data = await this.loadData()
//         data.latestFile = currentFile.path
//         await this.saveData(data)
//     }
// }

export default class HistoricaPlugin extends Plugin {


    async onload() {


        // console.log(corpus)

        const customChrono = await setupCustomChrono()
        const currentPlugin = this


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

                let currentFile = await getCurrentFile(currentPlugin)
                await writeLatestFileToData(currentPlugin, currentFile)
                // console.log(currentFile)

                await parseTFileAndUpdateDocuments(currentPlugin, currentFile, documentArray)

            } else {

                const includeFiles = blockConfig.include_files || []
                for (let i = 0; i < includeFiles.length; i++) {
                    const file = this.app.vault.getAbstractFileByPath(includeFiles[i])
                    // console.log(file)
                    if (file instanceof TFile) {
                        await parseTFileAndUpdateDocuments(this, file, documentArray)
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
            await writeLatestFileToData(currentPlugin, await getCurrentFile(currentPlugin))
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
        const currentPlugin = this

        await writeLatestFileToData(this, await getCurrentFile(currentPlugin))


    }

}



