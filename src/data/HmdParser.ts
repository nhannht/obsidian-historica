import {Attachment, TimelineDocument, HistoricaSettings, TimelineEntry, TimeData} from "../types";

function generateId(): string {
	const combined = Date.now().toString() + Math.floor(Math.random() * 1000000).toString();
	let hash = 0;
	for (let i = 0; i < combined.length; i++) {
		hash = ((hash << 5) - hash) + combined.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash).toString();
}

/**
 * Extra round-trip data that doesn't map to TimelineDocument fields.
 * Attached to the parse result so the serializer can reproduce them.
 */
export type HmdParseResult = TimelineDocument & {
	_extraFrontmatter?: [string, string][];
	_extraComments?: Map<string, string[]>;
};

const INIT = 0;
const FRONTMATTER = 1;
const BETWEEN = 2;
const FIELDS = 3;
const ATTACHMENTS = 4;
const BODY = 5;

function parseCommentLine(
	line: string,
	setId: (id: string) => void,
	setHidden: () => void,
	addExtra: (line: string) => void,
) {
	const inner = line.slice(2, -2).trim();
	if (inner.startsWith("id:")) {
		setId(inner.slice(3).trim());
	} else if (inner === "hidden") {
		setHidden();
	} else {
		addExtra(line);
	}
}

function parseYamlValue(raw: string): string | boolean {
	const trimmed = raw.trim();
	if (trimmed === "true") return true;
	if (trimmed === "false") return false;
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

export function parseHmd(content: string): HmdParseResult {
	const lines = content.split("\n");
	let state = INIT;

	const fmLines: string[] = [];
	const extraFrontmatter: [string, string][] = [];

	let currentTitle = "";
	let currentDate = "";
	let currentDateStyle = "";
	let currentSource = "";
	let currentId = "";
	let currentHidden = false;
	let currentAttachments: Attachment[] = [];
	let currentExtraComments: string[] = [];
	let bodyLines: string[] = [];

	const units: TimelineEntry[] = [];
	const extraComments = new Map<string, string[]>();

	let blockId = "";
	let autoSave = true;
	let header = "";
	let footer = "";

	function flushEntry() {
		if (!currentTitle && !currentDate) return;

		const time: TimeData = resolveTime(currentDate, currentDateStyle);
		const body = trimBody(bodyLines);
		const id = currentId || generateId();

		const unit: TimelineEntry = {
			id,
			parsedResultText: currentTitle,
			sentence: body,
			time,
			filePath: currentSource,
			attachments: currentAttachments,
			isExpanded: false,
			isHidden: currentHidden ? true : undefined,
		};

		if (currentExtraComments.length > 0) {
			extraComments.set(id, [...currentExtraComments]);
		}

		units.push(unit);
		resetEntry();
	}

	function resetEntry() {
		currentTitle = "";
		currentDate = "";
		currentDateStyle = "";
		currentSource = "";
		currentId = "";
		currentHidden = false;
		currentAttachments = [];
		currentExtraComments = [];
		bodyLines = [];
	}

	function parseFrontmatter() {
		for (const line of fmLines) {
			const colonIdx = line.indexOf(":");
			if (colonIdx === -1) continue;
			const key = line.slice(0, colonIdx).trim();
			const val = parseYamlValue(line.slice(colonIdx + 1));
			switch (key) {
				case "blockId":
					blockId = String(val);
					break;
				case "autoSave":
					autoSave = val === true || val === "true";
					break;
				case "header":
					header = String(val);
					break;
				case "footer":
					footer = String(val);
					break;
				default:
					extraFrontmatter.push([key, String(val)]);
					break;
			}
		}
	}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		switch (state) {
			case INIT:
				if (line.trim() === "---") {
					state = FRONTMATTER;
				}
				break;

			case FRONTMATTER:
				if (line.trim() === "---") {
					state = BETWEEN;
					parseFrontmatter();
				} else {
					fmLines.push(line);
				}
				break;

			case BETWEEN:
				if (line.startsWith("## ")) {
					currentTitle = line.slice(3).trim();
					state = FIELDS;
				}
				break;

			case FIELDS:
				if (line.trim() === "") {
					state = BODY;
				} else if (line.startsWith("%%") && line.endsWith("%%")) {
					parseCommentLine(line,
						id => currentId = id,
						() => currentHidden = true,
						l => currentExtraComments.push(l),
					);
				} else if (line === "attachments:") {
					state = ATTACHMENTS;
				} else {
					const sepIdx = line.indexOf(":: ");
					if (sepIdx !== -1) {
						const key = line.slice(0, sepIdx).trim();
						const val = line.slice(sepIdx + 3).trim();
						switch (key) {
							case "date":
								currentDate = val;
								break;
							case "date-style":
								currentDateStyle = val;
								break;
							case "source":
								currentSource = val;
								break;
						}
					}
				}
				break;

			case ATTACHMENTS:
				if (line.trim() === "") {
					state = BODY;
				} else if (line.startsWith("- [[") && line.endsWith("]]")) {
					const path = line.slice(4, -2);
					currentAttachments.push({
						id: generateId(),
						path,
					});
				} else if (line.startsWith("%%") && line.endsWith("%%")) {
					parseCommentLine(line,
						id => currentId = id,
						() => currentHidden = true,
						l => currentExtraComments.push(l),
					);
				} else {
					state = BODY;
					bodyLines.push(line);
				}
				break;

			case BODY:
				if (line.trim() === "---" && isBlankBefore(lines, i) && isBlankAfter(lines, i)) {
					flushEntry();
					state = BETWEEN;
				} else {
					bodyLines.push(line);
				}
				break;
		}
	}

	if (state === BODY || state === FIELDS || state === ATTACHMENTS) {
		flushEntry();
	}

	const settings: HistoricaSettings = {blockId, autoSave, header, footer};

	return {
		settings,
		units,
		_extraFrontmatter: extraFrontmatter.length > 0 ? extraFrontmatter : undefined,
		_extraComments: extraComments.size > 0 ? extraComments : undefined,
	};
}

function isBlankBefore(lines: string[], i: number): boolean {
	return i > 0 && lines[i - 1].trim() === "";
}

function isBlankAfter(lines: string[], i: number): boolean {
	return i < lines.length - 1 && lines[i + 1].trim() === "";
}

function resolveTime(dateValue: string, dateStyle: string): TimeData {
	if (dateStyle === "free") {
		return {style: "free", value: dateValue};
	}
	if (/^-?\d+$/.test(dateValue)) {
		return {style: "unix", value: dateValue};
	}
	const parsed = Date.parse(dateValue);
	if (!isNaN(parsed)) {
		return {style: "unix", value: String(parsed)};
	}
	return {style: "free", value: dateValue};
}

function trimBody(lines: string[]): string {
	let start = 0;
	while (start < lines.length && lines[start].trim() === "") start++;
	let end = lines.length - 1;
	while (end >= start && lines[end].trim() === "") end--;
	return lines.slice(start, end + 1).join("\n");
}

export function serializeHmd(data: HmdParseResult): string {
	const out: string[] = [];

	out.push("---");
	out.push(`blockId: "${data.settings.blockId}"`);
	if (data.settings.autoSave !== undefined) {
		out.push(`autoSave: ${data.settings.autoSave}`);
	}
	if (data.settings.header !== undefined) {
		out.push(`header: "${data.settings.header}"`);
	}
	if (data.settings.footer !== undefined) {
		out.push(`footer: "${data.settings.footer}"`);
	}
	if (data._extraFrontmatter) {
		for (const [key, val] of data._extraFrontmatter) {
			out.push(`${key}: "${val}"`);
		}
	}
	out.push("---");

	for (let i = 0; i < data.units.length; i++) {
		const unit = data.units[i];
		out.push("");

		out.push(`## ${unit.parsedResultText}`);
		out.push(`date:: ${unit.time.value}`);

		if (unit.time.style === "free") {
			out.push("date-style:: free");
		}

		if (unit.filePath) {
			out.push(`source:: ${unit.filePath}`);
		}

		out.push(`%%id: ${unit.id}%%`);

		if (unit.isHidden) {
			out.push("%%hidden%%");
		}

		const extras = data._extraComments?.get(unit.id);
		if (extras) {
			for (const c of extras) {
				out.push(c);
			}
		}

		if (unit.attachments.length > 0) {
			out.push("attachments:");
			for (const att of unit.attachments) {
				out.push(`- [[${att.path}]]`);
			}
		}

		out.push("");
		out.push(unit.sentence);

		if (i < data.units.length - 1) {
			out.push("");
			out.push("---");
		}
	}

	return out.join("\n") + "\n";
}

