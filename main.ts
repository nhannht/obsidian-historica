import {Notice, Plugin, TFile} from 'obsidian';
import {Token} from "marked";
import {GetTimelineDataFromDocumentArrayWithChrono} from "./src/GetTimelineDataFromDocumentArray";
import {parse} from "toml";
import {renderTimelineEntry} from "./src/renderTimelineEntry";
import compromise from 'compromise';
import {setupCustomChrono} from "./src/setupCustomChrono";
import corpus from "./corpus.json"

import './src/lib/codemirror'
import './src/mode/historica/historica'
import {HistoricaSettingTab} from "./src/historicaSettingTab";
import {parseTFileAndUpdateDocuments} from "./src/parseTFileAndUpdateDocuments";
import {HistoricaSetting, writeLatestFileToData} from "./src/writeLatestFileToData";
import {BlockConfig, verifyBlockConfig} from "./src/verifyBlockConfig";
import {getCurrentFile} from "./src/getCurrentFile";


const DEFAULT_SETTINGS: HistoricaSetting = {
    latestFile: "",
    showUseFulInformation: false,
    defaultStyle: "1"

}


export interface HistoricaQuery {
	start: string,
	end: string
}


// export const HISTORICA_VIEW_TYPE = "historica-note-location"

export default class HistoricaPlugin extends Plugin {

    settings: HistoricaSetting;
    modesToKeep = ["hypermd", "markdown", "null", "xml"];

    refreshLeaves = () => {
        // re-set the editor mode to refresh the syntax highlighting
        this.app.workspace.iterateCodeMirrors(cm => cm.setOption("mode", cm.getOption("mode")))
    }


    async onload() {
        await this.loadSettings()
        this.app.workspace.iterateCodeMirrors(cm => console.log(cm))
        this.app.workspace.onLayoutReady(() => {
            this.refreshLeaves()

        })
        // this.registerEditorExtension(ViewPlugin.fromClass(HistoricaHighlightBlock, {decorations: (plugin) => plugin.decorations}))

        // console.log(corpus)

        const customChrono = await setupCustomChrono()
		const currentPlugin: HistoricaPlugin = this

        this.registerMarkdownCodeBlockProcessor("historica", async (source, el, ctx) => {
            // console.log(ctx)

            // parse yaml in this block
            let blockConfig: BlockConfig = parse(source)
            // console.log(Object.keys(blockConfig).length === 0)
			blockConfig = await verifyBlockConfig(blockConfig, currentPlugin)


            let documentArray: Token[] = [];
			if (blockConfig.include_files === "all") {
				const allFiles = this.app.vault.getMarkdownFiles()
				for (const file of allFiles) {
					await parseTFileAndUpdateDocuments(currentPlugin, file, documentArray)
				}
			} else if (blockConfig.include_files!.length === 0) {

                let currentFile = await getCurrentFile(currentPlugin)
                await writeLatestFileToData(currentPlugin, currentFile)
                // console.log(currentFile)

                await parseTFileAndUpdateDocuments(currentPlugin, currentFile, documentArray)

            } else if (blockConfig.include_files !== "all" && blockConfig.include_files!.length > 0) {

				for (const file of blockConfig.include_files!) {
                    const currentFile = this.app.vault.getAbstractFileByPath(file)
                    if (currentFile instanceof TFile) {
                        await parseTFileAndUpdateDocuments(currentPlugin, currentFile, documentArray)
                    }
                }
			} else {
				new Notice("No file to include, check your config, include_files may be empty, list of file name or " +
					"simply use 'all' to include all files in the vault")
            }


            documentArray = documentArray.filter((token) => {
                return "tokens" in token ? token.tokens === undefined : true
            })
            // console.log(documentArray)
			// console.log("Query:")
			// console.log(blockConfig.query)

			let query: HistoricaQuery[] = []

			if (!blockConfig.query) {
				query = []
			} else if (Object.keys(blockConfig.query).length === 0) {
				query = []
			} else if (!Array.isArray(blockConfig.query)) {
				query = [blockConfig.query]
			} else if (Array.isArray(blockConfig.query) && blockConfig.query[0].start) {
				query = blockConfig.query
			} else {
				query = []
				new Notice("Your query is not valid, please check your query")
			}





            let timelineData = await GetTimelineDataFromDocumentArrayWithChrono(
                documentArray,
                customChrono,
                compromise,
                corpus,
				this.settings.showUseFulInformation,
				query
			)

            // console.log(timelineData)


            const style = blockConfig.style || 1


            await renderTimelineEntry(currentPlugin, timelineData, style, el)
            await writeLatestFileToData(currentPlugin, await getCurrentFile(currentPlugin))
        })

        this.addSettingTab(new HistoricaSettingTab(this.app, this))


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
		// highlight obsidian  code syntax
        // simply ignore the error releated to CodeMirror.modes, we using the built-in cm, esbuild will not touch them
        // @ts-ignore
        for (const key in CodeMirror.modes) {
            // @ts-ignore
            if (CodeMirror.modes.hasOwnProperty(key) && !this.modesToKeep.includes(key)) {
                // @ts-ignore
                delete CodeMirror.modes[key];
            }
            this.refreshLeaves()

        }


    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    }

    async saveSettings() {
        await this.saveData(this.settings)

    }


}



