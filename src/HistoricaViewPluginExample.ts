interface HistoricaCodeBlock {
	beginLineNumber: number,
	endLineNumber: number
}

export {}
// class HistoricaHighlightBlock implements PluginValue {
//     decorations: DecorationSet;
//
//     constructor(view: EditorView) {
//         this.decorations = this.buildDecorations(view)
//     }
//
//     update(update: ViewUpdate): void {
//         // console.log(update)
//         if (update.viewportChanged || update.docChanged) {
//             this.decorations = this.buildDecorations(update.view)
//
//         }
//     }
//
//     buildDecorations(view: EditorView) {
//         let beginBlockLineNumber = 0
//         let endBlockLineNumber = 0
//         let blocksToHighLight: HistoricaCodeBlock[] = []
//         const decorations: Array<Range<Decoration>> = []
//         for (const {from, to} of view.visibleRanges) {
//             syntaxTree(view.state).iterate({
//                 from, to,
//                 enter(node) {
//                     // start of block
//                     if (node.type.name.includes("HyperMD-codeblock-begin")) {
//                         const beginHistoricaBlockLine = view.state.doc.lineAt(node.from)
//                         const lineText = view.state.sliceDoc(beginHistoricaBlockLine.from, beginHistoricaBlockLine.to)
//                         if (/^\s*```\s*historica/.test(lineText)) {
//
//                             beginBlockLineNumber = beginHistoricaBlockLine.number
//                             // console.log(beginHistoricaBlockLine)
//                         }
//                     }
//                     // end of block
//                     if (node.type.name.includes("HyperMD-codeblock-end")) {
//                         const endOfHistoricaLine = view.state.doc.lineAt(node.from)
//                         endBlockLineNumber = endOfHistoricaLine.number
//                         // console.log(endOfHistoricaLine)
//                         blocksToHighLight.push({
//                             beginLineNumber: beginBlockLineNumber,
//                             endLineNumber: endBlockLineNumber
//                         })
//
//                     }
//                     // console.log(linesToHighlight)
//                 }
//             })
//         }
//         // console.log(blocksToHighLight)
//         // console.log(view.state.doc.lineAt(blocksToHighLight[0].beginLineNumber))
//         // console.log(view.state.doc.line(10).from)
//
//         // add js highlight to this block
//         // blocksToHighLight.map((block) => decorations.push(Decoration.mark({
//         //     class: "historica-code-block"
//         //
//         //
//         // }).range(view.state.doc.line(block.beginLineNumber).to, view.state.doc.line(block.endLineNumber).from)))
//         return RangeSet.of(decorations, true)
//
//
//     }
// }
