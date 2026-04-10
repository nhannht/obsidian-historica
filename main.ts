import {Plugin, TextFileView, WorkspaceLeaf} from 'obsidian';
import {EditorView, lineNumbers} from '@codemirror/view';
import {EditorState as CMState} from '@codemirror/state';
import {json, jsonParseLinter} from '@codemirror/lang-json';
import {linter, lintGutter} from '@codemirror/lint';
import {foldGutter, syntaxHighlighting, defaultHighlightStyle, bracketMatching, indentOnInput} from '@codemirror/language';
import {closeBrackets} from '@codemirror/autocomplete';
import HistoricaBlockManager from "@/src/backgroundLogic/HistoricaBlockManager";
import HistoricaChrono from "@/src/compute/ChronoParser";
import {registerHmdPostProcessor} from "@/src/data/HmdPostProcessor";


const JSON_VIEW_TYPE = "historica-json-view";

class JsonFileView extends TextFileView {
	cmEditor: EditorView;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.cmEditor = new EditorView({
			parent: this.contentEl,
			state: CMState.create({
				doc: "",
				extensions: [
					json(),
					linter(jsonParseLinter()),
					lintGutter(),
					foldGutter(),
					lineNumbers(),
					bracketMatching(),
					closeBrackets(),
					syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
					indentOnInput(),
					EditorView.lineWrapping,
					EditorView.updateListener.of((update) => {
						if (update.docChanged) this.requestSave();
					}),
				],
			}),
		});
	}

	getViewType(): string {
		return JSON_VIEW_TYPE;
	}

	override getDisplayText(): string {
		return this.file?.basename ?? "JSON";
	}

	getViewData(): string {
		return this.cmEditor.state.doc.toString();
	}

	setViewData(data: string, _clear: boolean): void {
		this.cmEditor.dispatch({
			changes: {from: 0, to: this.cmEditor.state.doc.length, insert: data},
		});
	}

	clear(): void {
		this.cmEditor.dispatch({
			changes: {from: 0, to: this.cmEditor.state.doc.length, insert: ""},
		});
	}
}

export default class HistoricaPlugin extends Plugin {
	historicaChrono = new HistoricaChrono()
	blockManager = new HistoricaBlockManager(this)

	darkModeAdapt = () => {
		if (document.body.hasClass("theme-dark")) {
			document.body.addClass("dark")
		} else {
			document.body.removeClass("dark")
		}
	}

	registerListener() {
		this.registerEvent(this.app.workspace.on("css-change", () => {
			this.darkModeAdapt()
		}))
	}

	override async onload() {
		this.darkModeAdapt()
		this.registerListener()
		this.registerView(JSON_VIEW_TYPE, (leaf) => new JsonFileView(leaf));
		registerHmdPostProcessor(this);
		await this.blockManager.registerHistoricaBlockNg()
	}

	override async onunload() {
	}
}
