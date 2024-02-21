import {Token} from "marked";
import {WinkMethods} from "wink-nlp";
type TimelineEntry = {
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
			timeline.push({
				date: eventDate,
				unixTime: new Date(eventDate).getTime() / 1000,
				sentence: entity.parentSentence().out(nlp.its.markedUpText)
			})
		});
	})

	return timeline.sort((a, b) => {
		return a.unixTime - b.unixTime

	})

}
