import {Notice, TFile} from "obsidian";
import {marked, Token} from "marked";
import HistoricaPlugin from "../../main";
import {Chrono, ParsedResult} from "chrono-node";
import {HistoricaQuery} from "./HistoricaUserBlockProcesser";


export interface TimelineEntry {
	dateString: string;
	dateStringCompact: string,
	unixTime: number;
	sentence: string;

}

export interface TimelineEntryChrono extends TimelineEntry {
	stringThatParseAsDate: string,
	importantInformation: string
}

export interface Document {
	raw: string,
	text: string,
	type: string,
}
export interface ParseUserTimeRangeQuery {
	start: {
		dateString: string,
		unixTime: number
	} | null,
	end: {
		dateString: string,
		unixTime: number
	} | null
}

export default class HistoricaDocumentProcesser {
	get plugin(): HistoricaPlugin {
		return this._plugin;
	}

	set plugin(value: HistoricaPlugin) {
		this._plugin = value;
	}

	private _plugin: HistoricaPlugin;

	constructor(plugin: HistoricaPlugin) {
		this._plugin = plugin;


	}

		async parseUserTimeRangeQuery(historicaQueryInputArray: HistoricaQuery[]) {
		const chrono = await this.plugin.historicaUltility.setupCustomChrono()
		let parseTimeArray: ParseUserTimeRangeQuery[] = []
		// @ts-ignore
		historicaQueryInputArray.map((timeInput) => {
			let start = null
			let end = null
			if (!timeInput.start && !timeInput.end) {
				new Notice("Your query is not valid, please check your query")
				return []

			}
			if (timeInput.start) {
				const startParsingResult = chrono.parse(timeInput.start)
				// console.log(parseTimeArray)
				if (startParsingResult) {
					start = {
						dateString: startParsingResult[0].date().toString(),
						unixTime: startParsingResult[0].date().getTime() / 1000
					}
				}
			}
			if (timeInput.end) {
				const endParsingResult = chrono.parse(timeInput.end)
				if (endParsingResult) {
					end = {
						dateString: endParsingResult[0].date().toString(),
						unixTime: endParsingResult[0].date().getTime() / 1000
					}
				}

			}
			parseTimeArray.push({
				start: start,
				end: end
			})


		})
		return parseTimeArray
	}


	 async  GetTimelineDataFromDocumentArrayWithChrono(tokens: Token[] | null,
																 customChrono: Chrono,
																 compromiseNLP: any,
																 userfulInformationPatternTag: string[],
																 isShowSummaryTitle: boolean,
																 query: HistoricaQuery[],
																 pintime: null): Promise<TimelineEntryChrono[]> {
	let timelineData: TimelineEntryChrono[] = []
	let documents: Document[] = []
	tokens?.forEach((token) => {
		if ("text" in token) {
			documents.push({
				raw: token.raw,
				text: token.text,
				type: token.type

			})
		}
	})

	// @ts-ignore
	documents?.forEach((doc) => {
		// console.log(text)
		let parseResults;
		if (pintime) {
			const referenceTime = customChrono.parse(pintime)
			// console.log(referenceTime)
			parseResults = customChrono.parse(doc.raw, referenceTime[0].start.date())
		} else {
			parseResults = customChrono.parse(doc.raw)
			// console.log(parseResults)
		}
		// console.log(parseResults)
		// console.log(parseResults)
		if (!parseResults || parseResults.length === 0) {
			return
		}
		parseResults.forEach((parseResult) => {
			const [startData, endData] = this.extractDataToParseResult(parseResult, isShowSummaryTitle, userfulInformationPatternTag, compromiseNLP, doc.raw)
			if (startData) {
				timelineData.push(startData)
			}
			if (endData) {
				timelineData.push(endData)
			}
		})


	})


	timelineData.sort((a, b) => {
		return a.unixTime - b.unixTime
	})
	let filterTimelineData: TimelineEntryChrono[] = []

	let parsedUserQueryArray = await this.parseUserTimeRangeQuery(query)
	if (parsedUserQueryArray.length === 0) {
		return timelineData
	}
	// console.log(parsedUserQueryArray)
	parsedUserQueryArray.map((parsedUserQuery) => {
		timelineData.map((timelineEntry) => {
			if (parsedUserQuery.start && parsedUserQuery.end) {
				if (timelineEntry.unixTime >= parsedUserQuery.start.unixTime && timelineEntry.unixTime <= parsedUserQuery.end.unixTime) {
					filterTimelineData.push(timelineEntry)
				}
			} else if (parsedUserQuery.start) {
				if (timelineEntry.unixTime >= parsedUserQuery.start.unixTime) {
					filterTimelineData.push(timelineEntry)
				}
			} else if (parsedUserQuery.end) {
				if (timelineEntry.unixTime <= parsedUserQuery.end.unixTime) {
					filterTimelineData.push(timelineEntry)
				}
			}
		})

	})

	// sort filterTimelineData
	filterTimelineData.sort((a, b) => {
		return a.unixTime - b.unixTime
	})

	return filterTimelineData
}


	extractStringBaseOnTag(tags: string[], compromiseNLP: any, text: string): string {
		for (const tag of tags) {
			const result = compromiseNLP(text).match(tag).json()
			// console.log(result)
			if (result.length != 0) {
				for (const r of result) {
					// exclude the r that have dot comma
					if (r.text.includes(".") || r.text.includes(",")) {
						continue
					}
					return r.text

				}
			}
		}
		return ""

	}

	 extractDataToParseResult(parsingResult: ParsedResult,
								  isShowSummaryTitle: boolean,
								  userfulInformationPatternTag: string[],
								  compromiseNLP: any,
								  text: string,) {
	let summaryTitle = ""
	let startData: TimelineEntryChrono | null = null;
	let endData: TimelineEntryChrono | null = null;
	if (parsingResult.start) {
		const start = parsingResult.start
		// console.log(start)
		const parseText = parsingResult.text
		if (isShowSummaryTitle) {
			summaryTitle = this.extractStringBaseOnTag(userfulInformationPatternTag, compromiseNLP, text)
		} else {
			summaryTitle = ""
		}

		startData = {
			importantInformation: summaryTitle,
			stringThatParseAsDate: parseText,
			dateString: start.date().toString(),
			dateStringCompact: start.date().toDateString(),
			unixTime: start.date().getTime() / 1000,
			sentence: text.replace(parseText, `<historica-mark>${parseText}</historica-mark>`)
		}

	}
	if (parsingResult.end) {
		const end = parsingResult.end
		const parseText = parsingResult.text
		if (isShowSummaryTitle) {
			summaryTitle = this.extractStringBaseOnTag(userfulInformationPatternTag, compromiseNLP, text)
		} else {
			summaryTitle = ""
		}

		endData = {
			importantInformation: summaryTitle,
			stringThatParseAsDate: parseText,
			dateString: end.date().toString(),
			dateStringCompact: end.date().toDateString(),
			unixTime: end.date().getTime() / 1000,
			sentence: text.replace(parseText, `<historica-mark>${parseText}</historica-mark>`)
		}
	}

	return [startData, endData]

}



	RecusiveGetToken(document: Token, tokens: any[]) {
		if ("type" in document && document.type === "text") {
			tokens.push(document)
		}
		if ("tokens" in document && document.tokens) {

			document.tokens.map((t) => {
				this.RecusiveGetToken(t, tokens)
			})
			// table
		}
		if ("rows" in document && document.rows) {
			document.rows.map((row: any[]) => {
				row.map((cell) => {
					this.RecusiveGetToken(cell, tokens)
				})
			})
		}
		if ("header" in document && document.header) {


			document.header.map((header: any[]) => {
				// @ts-ignore
				RecusiveGetToken(header, tokens)
			})
		}
		// for list
		if ("items" in document && document.items) {
			document.items.map((item: any) => {
				this.RecusiveGetToken(item, tokens)
			})
		}

		// filter only document which is the most module

	}


	async parseTFileAndUpdateDocuments(file: TFile | null, documents: Token[]) {
		if (!file) {
			return
		}
		const fileContent = await this.plugin.app.vault.read(file)

		function filterHTMLAndEmphasis(text: string) {
			const stripHTML = text.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, ""),
				stripEm1 = stripHTML.replace(/\*{1,3}(.*?)\*{1,3}/g, "$1"),
				stripEm2 = stripEm1.replace(/_{1,3}(.*?)_{1,3}/g, "$1"),
				stripStrike = stripEm2.replace(/~{1,2}(.*?)~{1,2}/g, "$1"),
				stripLink = stripStrike.replace(/!?\[(.*?)]\((.*?)\)/g, "").replace(/!?\[\[(.*?)]]/g, "");
			return stripLink

		}

		const fileContentStripHTML = filterHTMLAndEmphasis(fileContent)
		// console.log(fileContentStripHTML)
		const lexerResult = marked.lexer(fileContentStripHTML);

		// console.log(lexerResult)


		lexerResult.map((token) => {

			this.RecusiveGetToken(token, documents)
		})
		// filter token which is the smallest modulo


	}

}
