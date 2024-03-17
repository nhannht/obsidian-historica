import {Token} from "marked";
import {Chrono, ParsedResult, ParsingResult} from 'chrono-node';
import {parseUserTimeRangeQuery} from "./parseUserTimeRangeQuery";
import {HistoricaQuery} from "./verifyBlockConfig";
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

function extractStringBaseOnTag(tags: string[], compromiseNLP: any, text: string): string {
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

function extractDataToParseResult(parsingResult: ParsedResult,
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
			summaryTitle = extractStringBaseOnTag(userfulInformationPatternTag, compromiseNLP, text)
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
			summaryTitle = extractStringBaseOnTag(userfulInformationPatternTag, compromiseNLP, text)
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

export interface Document {
	raw: string,
	text: string,
	type: string,
}

export async function GetTimelineDataFromDocumentArrayWithChrono(tokens: Token[] | null,
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
			const [startData, endData] = extractDataToParseResult(parseResult, isShowSummaryTitle, userfulInformationPatternTag, compromiseNLP, doc.raw)
			if (startData) {
				timelineData.push(startData)
			}
			if (endData) {
				timelineData.push(endData)
			}
		})


	})

	const sortTimelineData = timelineData.sort((a, b) => {
		return a.unixTime - b.unixTime
	})
	let filterTimelineData: TimelineEntryChrono[] = []

	let parsedUserQueryArray = await parseUserTimeRangeQuery(query)
	if (parsedUserQueryArray.length === 0) {
		return sortTimelineData
	}
	// console.log(parsedUserQueryArray)
	parsedUserQueryArray.map((parsedUserQuery) => {
		sortTimelineData.map((timelineEntry) => {
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

	return filterTimelineData
}
