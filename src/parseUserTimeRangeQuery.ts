import {setupCustomChrono} from "./setupCustomChrono";
import {HistoricaQuery} from "./verifyBlockConfig";

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

export async function parseUserTimeRangeQuery(historicaQueryInputArray: HistoricaQuery[]) {
	const chrono = await setupCustomChrono()
	let parseTimeArray: ParseUserTimeRangeQuery[] = []
	historicaQueryInputArray.map((timeInput) => {
		let start = null
		let end = null
		if (timeInput.start) {
			const startParsingResult = chrono.parse(timeInput.start)
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
