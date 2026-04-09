import * as chrono from "chrono-node";
import {Chrono} from "chrono-node";
import {parseInt} from "lodash";
import {moment} from "../moment-fix";


const BCEpattern: RegExp[] = [
	/\b(\d{4})\s+B\.?C\.?E?\.?\b/i,
	/\b(\d{4})\s+Before\s+\w{1,2}\s+Christ\b/i,
	/\b(\d{4})\s+Before\s+\w{1,2}\s+Common\s+Era\b/i,
	/\bB\.?C\.?E?\.?:?\s+(\d{4})\b/i,
	/\bBefore\s+\w{1,2}\s+Christ\s+(\d{4})\b/i,
	/\bBefore\s+\w{1,2}\s+Common\s+Era\s+(\d{4})\b/i,
]

const ADpattern: RegExp[] = [
	/\b(\d{4})\s+A\.?D\.?E?\.?\b/i,
	/\b(\d{4})\s+Anno\s+Domini\b/i,
	/\bA\.?D\.?E?\.?:?\s+(\d{4})\b/i,
	/\bAnno\s+Domini\s+(\d{4})\b/i,
]

export default class HistoricaChrono {
	private _customChrono!: Chrono;

	async setupCustomChrono(): Promise<Chrono> {
		this._customChrono = chrono.en.casual.clone()

		// in/at/on... year
		this._customChrono.parsers.push({
			pattern: () => /\b(in|at|on|from|to|year)\s+(\d{4})\b/i,
			extract: (_context, match) => ({day: 1, month: 1, year: parseInt(match[2])})
		})
		// YYYY/MM/DD
		this._customChrono.parsers.push({
			pattern: () => /\b(\d{4})[\/,-](\d{1,2})[\/,-](\d{1,2})\b/i,
			extract: (_context, match) => ({day: parseInt(match[3]), month: parseInt(match[2]), year: parseInt(match[1])})
		})
		// MM/DD/YYYY
		this._customChrono.parsers.push({
			pattern: () => /\b(\d{1,2})[\/,-](\d{1,2})[\/,-](\d{4})\b/i,
			extract: (_context, match) => ({day: parseInt(match[2]), month: parseInt(match[1]), year: parseInt(match[3])})
		})
		// dd Mon YYYY
		this._customChrono.parsers.push({
			pattern: () => /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,7})\b/i,
			extract: (_context, match) => ({
				day: parseInt(match[1]),
				month: moment(`2000/${match[2]}/1`).month() + 1,
				year: parseInt(match[3])
			})
		})
		// Mon dd YYYY
		this._customChrono.parsers.push({
			pattern: () => /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{4})\b/i,
			extract: (_context, match) => ({
				day: parseInt(match[2]),
				month: new Date(Date.parse(match[1] + " 1, 2000")).getMonth() + 1,
				year: parseInt(match[3])
			})
		})
		// YYYY/MM
		this._customChrono.parsers.push({
			pattern: () => /\b(\d{4})[\/,-](\d{1,2})\b/i,
			extract: (_context, match) => ({day: 1, month: parseInt(match[2]), year: parseInt(match[1])})
		})
		// MM/YYYY
		this._customChrono.parsers.push({
			pattern: () => /\b(\d{1,2})[\/,-](\d{4})\b/i,
			extract: (_context, match) => ({day: 1, month: parseInt(match[1]), year: parseInt(match[2])})
		})
		// Mon YYYY
		this._customChrono.parsers.push({
			pattern: () => /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,7})\b/i,
			extract: (_context, match) => ({
				day: 1,
				month: moment(`2000/${match[1]}/1`).month() + 1,
				year: parseInt(match[2])
			})
		})

		// BCE patterns
		for (const pattern of BCEpattern) {
			this._customChrono.parsers.push({
				pattern: () => pattern,
				extract: (_context, match) => ({year: -parseInt(match[1])})
			})
		}
		// AD patterns
		for (const pattern of ADpattern) {
			this._customChrono.parsers.push({
				pattern: () => pattern,
				extract: (_context, match) => ({year: parseInt(match[1])})
			})
		}

		return this._customChrono
	}
}
