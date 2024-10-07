import {MarkdownPostProcessorContext, MarkdownView, TFile} from "obsidian";
import HistoricaPlugin from "@/main";
import {HistoricaSettingNg, NodeFromParseTree, SentenceWithOffset} from "@/src/global";
import {useEffect, useState} from "react";
import MarkdownProcesser from "@/src/MarkdownProcesser";

export function HistoricaBlockReactComponent(props: {
    src: string,
    ctx: MarkdownPostProcessorContext,
    thisPlugin: HistoricaPlugin
    settings: HistoricaSettingNg
}) {

    const [sentences, setSentences] = useState<SentenceWithOffset[]>([])

    async function JumpToParagraphPosition(n: NodeFromParseTree) {
        const fileNeedToBeOpen = props.thisPlugin.app.vault.getAbstractFileByPath(n.file.path)
        const leaf = props.thisPlugin.app.workspace.getLeaf(true)
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


    useEffect(() => {
        const extractTimeline = async () => {
            const markdownProcesser = new MarkdownProcesser(props.thisPlugin,props.settings)
            await markdownProcesser.parseAllFilesNg()
            // const allnodes = markdownProcesser.nodes
            const currentFile = props.thisPlugin.app.workspace.getActiveFile()
            if (currentFile) {
                let text = await props.thisPlugin.app.vault.read(currentFile)
                const sentencesWithOffSet = await markdownProcesser.ExtractValidSentences(text)
                setSentences(sentencesWithOffSet)

            }


            // console.log(allnodes)
        }
        extractTimeline().then()


    }, [])

    const [internalSettings, setInternalSettings] =
        useState<HistoricaSettingNg>(structuredClone(props.settings))
    const [isSettingQ, setIsSettingQ] = useState(false)


    return <div>
        <ul>
            {sentences.map((s, i) => {
                if (s.parsedResult.length != 0) {
                    let formattedText = s.text
                    s.parsedResult.map((r) => {
                        formattedText = formattedText.replace(r.text, `<historica-mark class="text-rose-500">${r.text}</historica-mark>`)
                    })
                    return <li
                        className={"border"}
                        key={i}
                        onClick={async () => {
                            await JumpToParagraphPosition(s.node)
                        }}
                        dangerouslySetInnerHTML={{__html: formattedText}}
                    ></li>

                }
                return null
            })}
        </ul>
    </div>
}
