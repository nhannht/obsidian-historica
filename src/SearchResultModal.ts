import {App, MarkdownView, Modal, Plugin, prepareSimpleSearch, SearchResult, TFile} from "obsidian";
import {FormatSentencesWithMarkElement} from "./FormatSentencesWithMarkElement";

export interface HistoricaSearchResult {
    title: string,
    path: string,
    results: SearchResult

}

/**
 * The stragedy here is create split the file content, which is a string, to array, base on the match of search result, enclosed them with mark and join them back
 * @param searchResult
 * @param fileContent
 */
function createFileContentArray(searchResult: SearchResult, fileContent: string) {
    let fileContentArray = []
    for (let i = 0; i < searchResult.matches.length; i++) {
        const start = searchResult.matches[i][0]
        const end = searchResult.matches[i][1]
        if (i === 0) {
            fileContentArray.push(fileContent.substring(0, start))
            fileContentArray.push("<historica-mark>" + fileContent.substring(start, end) + "</historica-mark>")

        } else if (i === searchResult.matches.length - 1) {
            fileContentArray.push(fileContent.substring(searchResult.matches[i - 1][1], start))
            fileContentArray.push("<historica-mark>" + fileContent.substring(start, end) + "</historica-mark>")
            fileContentArray.push(fileContent.substring(end))
        } else {
            fileContentArray.push(fileContent.substring(searchResult.matches[i - 1][1], start))
            fileContentArray.push("<historica-mark>" + fileContent.substring(start, end) + "</historica-mark>")
        }

    }
    return fileContentArray
}

async function HistoricaTimelineElementClickListener(thisModal: HistoricaSearchResultModal,
                                                     file: TFile,
                                                     lineContent: string,
                                                     index: number) {
    thisModal.close()

    // console.log(index)
    let leaf = thisModal.thisPlugin.app.workspace.getLeaf(false)

    const fileNeedToBeOpen = thisModal.thisPlugin.app.vault.getAbstractFileByPath(file.path)
    if (fileNeedToBeOpen instanceof TFile) {
        await leaf.openFile(fileNeedToBeOpen)
        await leaf.setViewState({
            type: "markdown",
            state: {
                active: true,
                line: index
            },
            active: true
        })
        // console.log(leaf.getViewState())

        let view = leaf.view as MarkdownView

        view.editor.setCursor({
            line: index,
            ch: 0
        })
        view.editor.setSelection({
            line: index,
            ch: 0
        }, {
            line: index,
            ch: lineContent.replace(/<historica-mark>/g, "").replace(/<\/historica-mark>/g, "").length
        })

        view.editor.focus()
        view.editor.scrollTo(0, index)
    }


}


export class HistoricaSearchResultModal extends Modal {
    readonly query: string
    readonly thisPlugin: Plugin

    constructor(app: App, query: string, thisPlugin: Plugin) {
        super(app)
        this.query = query
        this.thisPlugin = thisPlugin
    }


    async onOpen() {
        const {contentEl} = this

        const historicaSearchResultModalEl = contentEl.createEl('div', {
            cls: "historica-search-result-modal",
        })
        const searchFunction = prepareSimpleSearch(this.query)
        const files = this.app.vault.getMarkdownFiles()
        // let results: HistoricaSearchResult[] = []
        for (const file of files) {


            let fileContent = await this.app.vault.read(file)

            const searchResult: SearchResult | null = searchFunction(fileContent)

            if (searchResult && searchResult.matches.length > 0) {
                const historicaSearchFileNameContainer = historicaSearchResultModalEl.createEl("div", {
                    cls: "historica-search-filename-container"
                })
                const historicaSearchResultElementContainer = historicaSearchResultModalEl.createEl('div', {
                    cls: "historica-search-result-container"
                })


                // console.log(searchResult)
                historicaSearchFileNameContainer.createEl('h2', {
                    text: file.name,
                    cls: "historica-search-filename"
                })


                let fileContentArray = createFileContentArray(searchResult, fileContent)


                fileContent = fileContentArray.join("")
                // console.log(fileContent)
                fileContent.split("\n").forEach((line, index) => {


                    if (line.includes("historica-mark")) {
                        const historicaSearchResultElement = historicaSearchResultElementContainer.createEl("div", {
                            cls: "historica-search-result-element"
                        })
                        FormatSentencesWithMarkElement(line, historicaSearchResultElement)
                        historicaSearchResultElement.addEventListener('click',
                            async () => await HistoricaTimelineElementClickListener(this, file, line, index))


                    }

                })


            }

        }
        // console.log(results)

    }

    onClose() {
        super.onClose();
    }
}