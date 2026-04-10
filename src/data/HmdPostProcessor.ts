import {MarkdownPostProcessorContext} from "obsidian";
import HistoricaPlugin from "@/main";
import {HISTORICA_DATA_DIR} from "./TimelineDataManager";
import {formatHmdDate} from "./HmdDateFormat";

// Cache split lines per document text to avoid O(sections x lines) re-splitting
let cachedText = "";
let cachedLines: string[] = [];

function getLinesForText(text: string): string[] {
	if (text !== cachedText) {
		cachedText = text;
		cachedLines = text.split("\n");
	}
	return cachedLines;
}

export function registerHmdPostProcessor(plugin: HistoricaPlugin) {
	plugin.registerMarkdownPostProcessor((el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
		if (!ctx.sourcePath.startsWith(HISTORICA_DATA_DIR + "/")) return;

		const sectionInfo = ctx.getSectionInfo(el);
		if (!sectionInfo) return;
		const {text, lineStart, lineEnd} = sectionInfo;
		const allLines = getLinesForText(text);
		const sectionLines = allLines.slice(lineStart, lineEnd + 1);

		const firstLine = sectionLines[0]?.trim() ?? "";

		if (el.classList.contains("mod-frontmatter") || el.querySelector(".frontmatter")) {
			return;
		}

		if (firstLine.startsWith("## ")) {
			const title = firstLine.slice(3).trim();

			// Look ahead past this section to gather inline fields
			let dateValue = "";
			let dateStyle = "";
			let source = "";
			let i = lineEnd + 1;
			while (i < allLines.length) {
				const line = allLines[i].trim();
				if (line === "" || line.startsWith("## ") || line === "---") break;
				if (line.startsWith("date::")) dateValue = line.replace(/^date::\s*/, "");
				else if (line.startsWith("date-style::")) dateStyle = line.replace(/^date-style::\s*/, "");
				else if (line.startsWith("source::")) source = line.replace(/^source::\s*/, "");
				i++;
			}

			const card = document.createElement("div");
			card.className = "historica-hmd-card";

			const badge = document.createElement("div");
			badge.className = "historica-hmd-date-badge";
			badge.textContent = formatHmdDate(dateValue, dateStyle);
			card.appendChild(badge);

			const titleEl = document.createElement("div");
			titleEl.className = "historica-hmd-title";
			titleEl.textContent = title;
			card.appendChild(titleEl);

			if (source) {
				const sourceEl = document.createElement("div");
				sourceEl.className = "historica-hmd-source";
				const anchor = document.createElement("a");
				anchor.className = "internal-link";
				anchor.dataset.href = source;
				anchor.textContent = source;
				anchor.addEventListener("click", (e) => {
					e.preventDefault();
					plugin.app.workspace.openLinkText(source, ctx.sourcePath);
				});
				sourceEl.appendChild(anchor);
				card.appendChild(sourceEl);
			}

			el.empty();
			el.appendChild(card);
			el.addClass("historica-hmd-timeline");
			return;
		}

		if (firstLine.startsWith("date::") || firstLine.startsWith("%%") || firstLine === "attachments:") {
			el.empty();
			el.style.display = "none";
			return;
		}

		if (sectionLines.every(l => l.trim().startsWith("- [[") || l.trim() === "")) {
			el.empty();
			el.style.display = "none";
			return;
		}

		if (el.querySelector("hr")) {
			el.empty();
			el.style.display = "none";
			return;
		}

		if (el.textContent?.trim()) {
			el.addClass("historica-hmd-body");
		}
	});
}

