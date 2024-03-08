import {App, Plugin, PluginSettingTab, Setting, TFile} from 'obsidian';
import {marked, Token} from "marked";
import {RecusiveGetToken} from "./src/RecusiveGetToken";
import {GetTimelineDataFromDocumentArrayWithChrono} from "./src/GetTimelineDataFromDocumentArray";
import {parse} from "toml";
import {renderTimelineEntry} from "./src/renderTimelineEntry";
import compromise from 'compromise';
import {setupCustomChrono} from "./src/setupCustomChrono";
import corpus from "./corpus.json"

interface HistoricaSetting {
    latestFile: string
    showUseFulInformation: boolean
    defaultStyle: string
}

const DEFAULT_SETTINGS: HistoricaSetting = {
    latestFile: "",
    showUseFulInformation: false,
    defaultStyle: "1"

}

/**
 * get the current file. if the current file is not a TFile, get the latest file from plugin data.Why this function exist, because most time the plugin load faster than the buffer when fist start Obsidian, so getActiveFile - standard way to get current file in obsidian still not being loaded
 * @param currentPlugin
 */
async function getCurrentFile(currentPlugin: Plugin): Promise<TFile> {
    let currentFile: TFile | null = currentPlugin.app.workspace.getActiveFile();
    //@ts-ignore
    if (currentFile instanceof TFile) {

    } else {


        let data: HistoricaSetting = await currentPlugin.loadData()

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
async function writeLatestFileToData(currentPlugin: Plugin, file: TFile) {
    let settings: HistoricaSetting = await currentPlugin.loadData()
    if (!settings) {
        settings = {
            latestFile: file.path,
            showUseFulInformation: true,
            defaultStyle: "1"
        }

    }
    settings.latestFile = file.path
    await currentPlugin.saveData(settings)

}


/**
 * parse tfile to documents. documents is a global array that will be updated be side effect after each parse
 * @param currentPlugin
 * @param file
 * @param documents
 */
async function parseTFileAndUpdateDocuments(currentPlugin: Plugin, file: TFile | null, documents: Token[]) {
    if (!file) {
        return
    }
    const fileContent = await currentPlugin.app.vault.read(file)

    function filterHTMLAndEmphasis(text: string) {
        const stripHTML = text.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, ""),
            stripEm1 = stripHTML.replace(/\*{1,3}(.*?)\*{1,3}/g, "$1"),
            stripEm2 = stripEm1.replace(/_{1,3}(.*?)_{1,3}/g, "$1"),
            stripStrike = stripEm2.replace(/~{1,2}(.*?)~{1,2}/g, "$1"),
            stripImage = stripStrike.replace(/!\[(.*?)]\((.*?)\)/g, "$2").replace(/!\[\[(.*?\.(png|jpeg|jpg|gif))]]/g, "$1");
        return stripImage

    }

    const fileContentStripHTML = filterHTMLAndEmphasis(fileContent)
    // console.log(fileContentStripHTML)
    const lexerResult = marked.lexer(fileContentStripHTML);

    // console.log(lexerResult)


    lexerResult.map((token) => {

        RecusiveGetToken(token, documents)
    })
    // filter token which is the smallest modulo


}

interface BlockConfig {
    style: number | 1,
    include_files?: string[] | [],


}


export default class HistoricaPlugin extends Plugin {

    settings: HistoricaSetting;


    async onload() {
        await this.loadSettings()


        // console.log(corpus)

        const customChrono = await setupCustomChrono()
        const currentPlugin = this



        this.registerMarkdownCodeBlockProcessor("historica", async (source, el, ctx) => {

            // parse yaml in this block
            let blockConfig: BlockConfig = parse(source)
            // console.log(Object.keys(blockConfig).length === 0)
            if (Object.keys(blockConfig).length === 0) {
                const defaultStyle = this.settings.defaultStyle
                blockConfig = {
                    style: parseInt(defaultStyle),
                    include_files: [],

                    // exclude_files: []
                }

            }
            // console.log(blockConfig)

            if (![1, 2].includes(blockConfig.style) || !blockConfig.style) {
                blockConfig.style = parseInt(this.settings.defaultStyle)

            }

            if (!blockConfig.include_files) {
                blockConfig.include_files = []
            }


            let documentArray: Token[] = [];

            if (blockConfig.include_files.length === 0) {

                let currentFile = await getCurrentFile(currentPlugin)
                await writeLatestFileToData(currentPlugin, currentFile)
                // console.log(currentFile)

                await parseTFileAndUpdateDocuments(currentPlugin, currentFile, documentArray)

            }
            if (blockConfig.include_files.length > 0) {

                for (const file of blockConfig.include_files) {
                    const currentFile = this.app.vault.getAbstractFileByPath(file)
                    if (currentFile instanceof TFile) {
                        await parseTFileAndUpdateDocuments(currentPlugin, currentFile, documentArray)
                    }
                }
            }


            documentArray = documentArray.filter((token) => {
                return "tokens" in token ? token.tokens === undefined : true
            })
            // console.log(documentArray)


            let timelineData = await GetTimelineDataFromDocumentArrayWithChrono(
                documentArray,
                customChrono,
                compromise,
                corpus,
                this.settings.showUseFulInformation)


            const style = blockConfig.style || 1


            await renderTimelineEntry(timelineData, style, el)
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


    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    }

    async saveSettings() {
        await this.saveData(this.settings)

    }



}

class HistoricaSettingTab extends PluginSettingTab {
    plugin: HistoricaPlugin;

    constructor(app: App, plugin: HistoricaPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): any {
        const {containerEl} = this;
        containerEl.empty();
        const settings = this.plugin.settings;
        new Setting(containerEl)
            .setName("Default Style")
            .setDesc("Choose the default style for the timeline")
            .addDropdown(dropdown => {
                dropdown.addOption('1', 'Style 1')
                dropdown.addOption('2', 'Style 2')
                dropdown.setValue(settings.defaultStyle)
                dropdown.onChange(async (value) => {
                    settings.defaultStyle = value
                    await this.plugin.saveSettings()
                })
            })
        new Setting(containerEl)
            .setName("Show Summary Title")
            .setDesc("Show short title in the timeline, turn it off if you think it is not smart enough, and this will make this plugin run at fastest speed")
            .addToggle(toggle => {
                toggle.setValue(settings.showUseFulInformation)
                toggle.onChange(async (value) => {
                    settings.showUseFulInformation = value
                    await this.plugin.saveSettings()
                })
            })
    }

}



