import {Token} from "marked";
import {Chrono, ParsedResult} from 'chrono-node';
import {parseUserTimeRangeQuery} from "./parseUserTimeRangeQuery";
import {HistoricaQuery} from "../main";

export interface TimelineEntry {
    date: string;
    unixTime: number;
    sentence: string;

}

export interface TimelineEntryChrono extends TimelineEntry {
    dateString: string,
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
        const parseText = parsingResult.text
        if (isShowSummaryTitle) {
            summaryTitle = extractStringBaseOnTag(userfulInformationPatternTag, compromiseNLP, text)
        } else {
            summaryTitle = ""
        }

        startData = {
            importantInformation: summaryTitle,
            dateString: parseText,
            date: start.date().toString(),
            unixTime: start.date().getTime() / 1000,
            sentence: text.replace(parseText, `<historica-mark>${parseText}</historica-mark>`)
        }

    }
    if (parsingResult.end) {
        const start = parsingResult.end
        const parseText = parsingResult.text
        if (isShowSummaryTitle) {
            summaryTitle = extractStringBaseOnTag(userfulInformationPatternTag, compromiseNLP, text)
        } else {
            summaryTitle = ""
        }

        endData = {
            importantInformation: summaryTitle,
            dateString: parseText,
            date: start.date().toString(),
            unixTime: start.date().getTime() / 1000,
            sentence: text.replace(parseText, `<historica-mark>${parseText}</historica-mark>`)
        }

    }

    return [startData, endData]

}


export async function GetTimelineDataFromDocumentArrayWithChrono(documents: Token[] | null,
                                                                 customChrono: Chrono,
                                                                 compromiseNLP: any,
                                                                 userfulInformationPatternTag: string[],
																 isShowSummaryTitle: boolean,
																 query: HistoricaQuery[]): Promise<TimelineEntryChrono[]> {
    let timelineData: TimelineEntryChrono[] = []
    // console.log(userfulInformationPatternTag)

    // @ts-ignore
    documents?.forEach(({text}: { text: string }) => {
        // console.log(text)
        const parseResults = customChrono.parse(text)
        // console.log(parseResults)
        if (!parseResults || parseResults.length === 0) {
            return
        }
        parseResults.forEach((parseResult) => {
            const [startData, endData] = extractDataToParseResult(parseResult, isShowSummaryTitle, userfulInformationPatternTag, compromiseNLP, text)
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
