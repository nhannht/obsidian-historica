import * as chrono from "chrono-node";
import {Chrono} from "chrono-node";

import {moment} from "../moment-fix";


const BCEpattern: RegExp[] = [
	/\b(\d{1,4})\s+B\.?C\.?E?\.?\b/i,
	/\b(\d{1,4})\s+Before\s+\w{1,2}\s+Christ\b/i,
	/\b(\d{1,4})\s+Before\s+\w{1,2}\s+Common\s+Era\b/i,
	/\bB\.?C\.?E?\.?:?\s+(\d{1,4})\b/i,
	/\bBefore\s+\w{1,2}\s+Christ\s+(\d{1,4})\b/i,
	/\bBefore\s+\w{1,2}\s+Common\s+Era\s+(\d{1,4})\b/i,
]

const ADpattern: RegExp[] = [
	/\b(\d{1,4})\s+A\.?D\.?E?\.?\b/i,
	/\b(\d{1,4})\s+Anno\s+Domini\b/i,
	/\bA\.?D\.?E?\.?:?\s+(\d{1,4})\b/i,
	/\bAnno\s+Domini\s+(\d{1,4})\b/i,
]

export default class HistoricaChrono {
	private _customChrono: Chrono | undefined;

	async setupCustomChrono(): Promise<Chrono> {
		if (this._customChrono) return this._customChrono;
		this._customChrono = chrono.en.casual.clone()

		// Remove UnlikelyFormatFilter — it rejects bare year matches like "1939".
		// Our custom parsers already validate year ranges (1000-2099) to avoid false positives.
		this._customChrono.refiners = this._customChrono.refiners.filter(
			(r: any) => r.constructor.name !== "UnlikelyFormatFilter"
		)

		const seasonMonths: Record<string, number> = {spring: 3, summer: 6, autumn: 9, fall: 9, winter: 12}
		const wordNumbers: Record<string, number> = {a: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10}
		const unitMultipliers: Record<string, number> = {year: 1, years: 1, decade: 10, decades: 10, century: 100, centuries: 100}

		// === Relative temporal expression parsers (SUTime/HeidelTime-style) ===

		// "the previous year", "the following year", "the next year"
		this._customChrono.parsers.push({
			pattern: () => /\b(?:the\s+)?(previous|preceding|prior|following|next|subsequent)\s+year\b/i,
			extract: (context, match) => {
				const refYear = context.refDate.getFullYear()
				const dir = /previous|preceding|prior/i.test(match[1]) ? -1 : 1
				return {day: 1, month: 1, year: refYear + dir}
			}
		})

		// "N years/decades later/earlier", "just 14 years later", "a decade earlier"
		this._customChrono.parsers.push({
			pattern: () => /\b(?:just\s+)?(\d+|a|one|two|three|four|five|six|seven|eight|nine|ten)\s+(year|years|decade|decades|century|centuries)\s+(earlier|later|before|after|hence)\b/i,
			extract: (context, match) => {
				const refYear = context.refDate.getFullYear()
				const n = wordNumbers[match[1].toLowerCase()] ?? parseInt(match[1])
				if (isNaN(n)) return null
				const mult = unitMultipliers[match[2].toLowerCase()] ?? 1
				const dir = /earlier|before/i.test(match[3]) ? -1 : 1
				return {day: 1, month: 1, year: refYear + (n * mult * dir)}
			}
		})

		// "a year after Marathon", "two decades before X"
		this._customChrono.parsers.push({
			pattern: () => /\b(\d+|a|one|two|three|four|five|six|seven|eight|nine|ten)\s+(year|years|decade|decades|century|centuries)\s+(after|before|since)\s+\w+/i,
			extract: (context, match) => {
				const refYear = context.refDate.getFullYear()
				const n = wordNumbers[match[1].toLowerCase()] ?? parseInt(match[1])
				if (isNaN(n)) return null
				const mult = unitMultipliers[match[2].toLowerCase()] ?? 1
				const dir = /before/i.test(match[3]) ? -1 : 1
				return {day: 1, month: 1, year: refYear + (n * mult * dir)}
			}
		})

		// === BC-context propagation parsers ===

		// "the rest of 496", "early 496", "mid 480" — bare number with BC polarity from anchor
		this._customChrono.parsers.push({
			pattern: () => /\b(?:the\s+rest\s+of|the\s+end\s+of|the\s+start\s+of|the\s+beginning\s+of)\s+(\d{1,4})\b/i,
			extract: (context, match) => {
				const refYear = context.refDate.getFullYear()
				const rawYear = parseInt(match[1])
				if (refYear < 0) return {day: 1, month: 1, year: -rawYear}
				return {day: 1, month: 1, year: rawYear}
			}
		})

		// "Early in spring", "late winter", "mid autumn" — season with modifier
		this._customChrono.parsers.push({
			pattern: () => /\b(?:early|late|mid)\s+(?:in\s+)?(spring|summer|autumn|fall|winter)\b/i,
			extract: (context, match) => {
				const refYear = context.refDate.getFullYear()
				return {
					day: 1,
					month: seasonMonths[match[1].toLowerCase()] ?? 1,
					year: refYear
				}
			}
		})

		// Bare season (no preposition): "Spring", "Winter" — only in 2-pass context
		this._customChrono.parsers.push({
			pattern: () => /\b(spring|summer|autumn|fall|winter)\b/i,
			extract: (context, match) => {
				const refYear = context.refDate.getFullYear()
				const currentYear = new Date().getFullYear()
				// Only activate in 2-pass context (refDate differs from current year)
				if (refYear === currentYear) return null
				return {
					day: 1,
					month: seasonMonths[match[1].toLowerCase()] ?? 1,
					year: refYear
				}
			}
		})

		// Bare month in BC context: "mid-August", "September" — only when anchor is BC
		this._customChrono.parsers.push({
			pattern: () => /\b(?:mid[- ]?)?(January|February|March|April|May|June|July|August|September|October|November|December)\b/i,
			extract: (context, match) => {
				const refYear = context.refDate.getFullYear()
				// Only activate for BC context — let chrono built-in handle AD months
				if (refYear >= 0) return null
				const monthName = match[1] || match[0].replace(/^mid[- ]?/i, "")
				const monthNum = new Date(Date.parse(monthName + " 1, 2000")).getMonth() + 1
				return {day: 1, month: monthNum, year: refYear}
			}
		})

		// === Standard date format parsers ===

		// Standalone 4-digit year
		this._customChrono.parsers.push({
			pattern: () => /\b(\d{4})\b/i,
			extract: (_context, match) => {
				const year = parseInt(match[1])
				if (year < 1000 || year > 2099) return null
				return {day: 1, month: 1, year}
			}
		})

		// in/at/on/by/since/circa... year
		this._customChrono.parsers.push({
			pattern: () => /\b(in|at|on|from|to|year|by|since|until|around|circa|c\.|ca\.)\s+(\d{4})\b/i,
			extract: (_context, match) => ({day: 1, month: 1, year: parseInt(match[2])})
		})
		// YYYY/MM/DD
		this._customChrono.parsers.push({
			pattern: () => /\b(\d{4})[\/,-](\d{1,2})[\/,-](\d{1,3})\b/i,
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

		// Season + year: "the spring of 1916", "summer 1942"
		this._customChrono.parsers.push({
			pattern: () => /\b(spring|summer|autumn|fall|winter)\s+(?:of\s+)?(\d{4})\b/i,
			extract: (_context, match) => ({
				day: 1,
				month: seasonMonths[match[1].toLowerCase()] ?? 1,
				year: parseInt(match[2])
			})
		})

		// Standalone season with article/preposition: "the summer", "in spring", "during the winter"
		// Only produces results when a referenceDate provides the year (2-pass parsing)
		this._customChrono.parsers.push({
			pattern: () => /\b(?:the|in|during|during the|by)\s+(spring|summer|autumn|fall|winter)\b/i,
			extract: (context, match) => {
				const refYear = context.refDate.getFullYear()
				return {
					day: 1,
					month: seasonMonths[match[1].toLowerCase()] ?? 1,
					year: refYear
				}
			}
		})

		// early/late/mid + year: "early 1941", "late 1942", "mid-1943"
		this._customChrono.parsers.push({
			pattern: () => /\b(early|late|mid|the\s+start\s+of|the\s+end\s+of|the\s+beginning\s+of)\s+-?(\d{4})\b/i,
			extract: (_context, match) => ({day: 1, month: 1, year: parseInt(match[2])})
		})

		// BC range pattern: "499-493 BC", "492-490 BCE"
		// Extracts the first number in the range as a BC date
		this._customChrono.parsers.push({
			pattern: () => /\b(\d{1,4})\s*[-–]\s*\d{1,4}\s+(?:BC|BCE|B\.C\.?E?\.?)\b/i,
			extract: (_context, match) => ({year: -parseInt(match[1])})
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

		// Refiner: correct month/season-only results in BC context
		// Chrono's built-in month parser uses refDate but may compute wrong year
		// (e.g., "September" with ref Jan 480 BC → Sep 481 BC instead of Sep 480 BC)
		this._customChrono.refiners.push({
			refine: (context: any, results: any[]) => {
				const refYear = context.refDate.getFullYear()
				if (refYear >= 0) return results
				for (const r of results) {
					// If the result is a month/season match without explicit year, force refDate year
					if (!r.start.isCertain("year") && r.start.get("year") !== refYear) {
						r.start.assign("year", refYear)
					}
				}
				return results
			}
		})

		return this._customChrono
	}
}
