import {Token} from "marked";
import {WinkMethods} from "wink-nlp";
import * as chrono from 'chrono-node';
import {Chrono} from 'chrono-node';

export interface TimelineEntry  {
	date: string;
	unixTime: number;
	sentence: string;

}

/**
 * get timeline data from document array, the document array is the output from lexical parser of mark.js
 * @example
 * const lexerResult = marked.lexer(await this.app.vault.read(currentFile));
 let documentArray: Token[] = [];
 lexerResult.map((token) => {
 RecusiveGetToken(token, documentArray)
 })
 */
export async function GetTimelineDataFromDocumentArray(documents: Token[] | null, nlp: WinkMethods) {
	let timeline: TimelineEntry[] = []
	// learn new entities pattern must occur before read doc
	nlp.learnCustomEntities([
		{name: 'custom date', patterns: ['DATE']}
	]);
	documents?.forEach((token) => {

		//@ts-ignore
		const doc = nlp.readDoc(token.text);
		// Extract entities.
		doc.customEntities().each((entity) => {

			entity.markup("<historica-mark>", "</historica-mark>")
			// console.log(entity.out())
			const eventDate = entity.out()
			let unitTime = new Date(eventDate).getTime() / 1000
			if (isNaN(unitTime)) {
				// @ts-ignore
				unitTime = chrono.parseDate(eventDate).getTime() / 1000
			}
			timeline.push({
				date: eventDate,
				unixTime: unitTime,
				sentence: entity.parentSentence().out(nlp.its.markedUpText)
			})
		});
	})

	return timeline.sort((a, b) => {
		return a.unixTime - b.unixTime

	})

}
export interface TimelineEntryChrono extends TimelineEntry  {
	dateString: string,
}
export async function GetTimelineDataFromDocumentArrayWithChrono(documents: Token[] | null, customChrono: Chrono) {
	let timelineData: TimelineEntryChrono[] = []
	// @ts-ignore
	documents?.forEach(({text}: { text: string }) => {
		// console.log(text)
		const parseResult = customChrono.parse(text)
		if (!parseResult || parseResult.length === 0) {
			return
		}

		if (parseResult[0].start) {
			const start = parseResult[0].start
			const parseText = parseResult[0].text
			timelineData.push({
				dateString: parseText,
				date: start.date().toString(),
				unixTime: start.date().getTime() / 1000,
				sentence: text.replace(parseText, `<historica-mark>${parseText}</historica-mark>`)
			})
		}
		if (parseResult[0].end) {
			const end = parseResult[0].end
			const parseText = parseResult[0].text
			timelineData.push({
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
