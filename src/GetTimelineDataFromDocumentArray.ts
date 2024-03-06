import {Token} from "marked";
import {Chrono} from 'chrono-node';

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

export async function GetTimelineDataFromDocumentArrayWithChrono(documents: Token[] | null,
																 customChrono: Chrono,
																 compromiseNLP: any,
																 userfulInformationPatternTag: string[],
																 showSummaryTitle: boolean = true): Promise<TimelineEntryChrono[]> {
	let timelineData: TimelineEntryChrono[] = []
	// console.log(userfulInformationPatternTag)

	// @ts-ignore
	documents?.forEach(({text}: { text: string }) => {
		// console.log(text)
		const parseResult = customChrono.parse(text)
		// console.log(parseResult)
		if (!parseResult || parseResult.length === 0) {
			return
		}
		let summaryTitle = ""

		if (parseResult[0].start) {
			const start = parseResult[0].start
			const parseText = parseResult[0].text
			if (showSummaryTitle) {
				summaryTitle = extractStringBaseOnTag(userfulInformationPatternTag, compromiseNLP, text)
			} else {
				summaryTitle = ""
			}

			timelineData.push({
				importantInformation: summaryTitle,
				dateString: parseText,
				date: start.date().toString(),
				unixTime: start.date().getTime() / 1000,
				sentence: text.replace(parseText, `<historica-mark>${parseText}</historica-mark>`)
			})
		}
		if (parseResult[0].end) {
			if (showSummaryTitle) {
				summaryTitle = extractStringBaseOnTag(userfulInformationPatternTag, compromiseNLP, text)
			} else {
				summaryTitle = ""
			}
			const end = parseResult[0].end
			const parseText = parseResult[0].text
			timelineData.push({
				importantInformation: summaryTitle,
				dateString: parseText,
				date: end.date().toString(),
				unixTime: end.date().getTime() / 1000,
				sentence: text.replace(parseText, `<historica-mark>${parseText}</historica-mark>`)
			})
		}


	})
	return timelineData.sort((a, b) => {
		return a.unixTime - b.unixTime
	})
}
