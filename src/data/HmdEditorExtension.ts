import {editorInfoField} from "obsidian";
import HistoricaPlugin from "@/main";
import {HISTORICA_DATA_DIR} from "./TimelineDataManager";
import {formatHmdDate} from "./HmdDateFormat";
import {
	Decoration,
	DecorationSet,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import {RangeSetBuilder} from "@codemirror/state";

class DateBadgeWidget extends WidgetType {
	constructor(private formatted: string) { super(); }

	toDOM(): HTMLElement {
		const span = document.createElement("span");
		span.className = "historica-hmd-date-badge historica-hmd-editor-widget";
		span.textContent = this.formatted;
		return span;
	}

	override eq(other: DateBadgeWidget): boolean {
		return this.formatted === other.formatted;
	}
}

class SourceLinkWidget extends WidgetType {
	constructor(private path: string, private plugin: HistoricaPlugin, private sourcePath: string) { super(); }

	toDOM(): HTMLElement {
		const span = document.createElement("span");
		span.className = "historica-hmd-source historica-hmd-editor-widget";
		const anchor = document.createElement("a");
		anchor.className = "internal-link";
		anchor.dataset.href = this.path;
		anchor.textContent = this.path;
		anchor.addEventListener("click", (e) => {
			e.preventDefault();
			this.plugin.app.workspace.openLinkText(this.path, this.sourcePath);
		});
		span.appendChild(anchor);
		return span;
	}

	override eq(other: SourceLinkWidget): boolean {
		return this.path === other.path;
	}
}

class SeparatorWidget extends WidgetType {
	toDOM(): HTMLElement {
		const hr = document.createElement("div");
		hr.className = "historica-hmd-separator";
		return hr;
	}

	override eq(): boolean { return true; }
}

function findFrontmatterEnd(doc: {lines: number; line(n: number): {text: string}}): number {
	if (doc.lines < 1 || doc.line(1).text.trim() !== "---") return 0;
	for (let i = 2; i <= doc.lines; i++) {
		if (doc.line(i).text.trim() === "---") return i;
	}
	return 0;
}

function buildDecorations(view: EditorView, plugin: HistoricaPlugin): DecorationSet {
	const info = view.state.field(editorInfoField);
	const filePath = info?.file?.path;
	if (!filePath?.startsWith(HISTORICA_DATA_DIR + "/")) {
		return Decoration.none;
	}

	const builder = new RangeSetBuilder<Decoration>();
	const doc = view.state.doc;
	const cursorLine = view.state.selection.main.head;
	const cursorLineNumber = doc.lineAt(cursorLine).number;
	const frontmatterEnd = findFrontmatterEnd(doc);

	for (const {from, to} of view.visibleRanges) {
		let pos = from;
		while (pos <= to) {
			const line = doc.lineAt(pos);
			const lineNum = line.number;
			const trimmed = line.text.trim();

			if (lineNum === cursorLineNumber || lineNum <= frontmatterEnd) {
				pos = line.to + 1;
				continue;
			}

			if (trimmed.startsWith("date::")) {
				const value = trimmed.replace(/^date::\s*/, "");
				// Forward-peek for date-style:: on the next few lines
				let style = "";
				for (let j = lineNum + 1; j <= Math.min(lineNum + 3, doc.lines); j++) {
					const next = doc.line(j).text.trim();
					if (next.startsWith("date-style::")) {
						style = next.replace(/^date-style::\s*/, "");
						break;
					}
					if (next === "" || next.startsWith("## ") || next === "---") break;
				}
				builder.add(line.from, line.to, Decoration.replace({
					widget: new DateBadgeWidget(formatHmdDate(value, style)),
				}));
			}
			else if (trimmed.startsWith("date-style::")) {
				builder.add(line.from, line.to, Decoration.replace({}));
			}
			else if (trimmed.startsWith("source::")) {
				const path = trimmed.replace(/^source::\s*/, "");
				builder.add(line.from, line.to, Decoration.replace({
					widget: new SourceLinkWidget(path, plugin, filePath),
				}));
			}
			else if (trimmed.startsWith("%%") && trimmed.endsWith("%%")) {
				builder.add(line.from, line.from, Decoration.line({
					class: "historica-hmd-dim",
				}));
			}
			else if (trimmed === "---") {
				builder.add(line.from, line.to, Decoration.replace({
					widget: new SeparatorWidget(),
				}));
			}

			pos = line.to + 1;
		}
	}

	return builder.finish();
}

export function hmdEditorExtension(plugin: HistoricaPlugin) {
	let lastCursorLine = -1;

	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			constructor(view: EditorView) {
				this.decorations = buildDecorations(view, plugin);
				lastCursorLine = view.state.doc.lineAt(view.state.selection.main.head).number;
			}
			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged) {
					this.decorations = buildDecorations(update.view, plugin);
					lastCursorLine = update.view.state.doc.lineAt(update.view.state.selection.main.head).number;
				} else if (update.selectionSet) {
					const newLine = update.view.state.doc.lineAt(update.view.state.selection.main.head).number;
					if (newLine !== lastCursorLine) {
						lastCursorLine = newLine;
						this.decorations = buildDecorations(update.view, plugin);
					}
				}
			}
		},
		{decorations: v => v.decorations},
	);
}
