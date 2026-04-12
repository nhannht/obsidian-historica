import * as chrono from "chrono-node";
import {Chrono} from "chrono-node";
import {franc} from "franc";

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

export const seasonMonths: Record<string, number> = {spring: 3, summer: 6, autumn: 9, fall: 9, winter: 12}
export const wordNumbers: Record<string, number> = {a: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10}
export const unitMultipliers: Record<string, number> = {year: 1, years: 1, decade: 10, decades: 10, century: 100, centuries: 100}

function parseMonthName(name: string): number {
	return moment(`2000/${name}/1`).month() + 1
}

// "the previous year", "the following year", "the next year"
export const previousFollowingYearParser = {
	pattern: () => /\b(?:the\s+)?(previous|preceding|prior|following|next|subsequent)\s+year\b/i,
	extract: (context: any, match: any) => {
		const refYear = context.refDate.getFullYear()
		const dir = /previous|preceding|prior/i.test(match[1]) ? -1 : 1
		return {day: 1, month: 1, year: refYear + dir}
	}
}

// "N years/decades later/earlier", "just 14 years later", "a decade earlier"
export const nYearsLaterEarlierParser = {
	pattern: () => /\b(?:just\s+)?(\d+|a|one|two|three|four|five|six|seven|eight|nine|ten)\s+(year|years|decade|decades|century|centuries)\s+(earlier|later|before|after|hence)\b/i,
	extract: (context: any, match: any) => {
		const refYear = context.refDate.getFullYear()
		const n = wordNumbers[match[1].toLowerCase()] ?? parseInt(match[1])
		if (isNaN(n)) return null
		const mult = unitMultipliers[match[2].toLowerCase()] ?? 1
		const dir = /earlier|before/i.test(match[3]) ? -1 : 1
		return {day: 1, month: 1, year: refYear + (n * mult * dir)}
	}
}

// "a year after Marathon", "two decades before X"
export const nYearsAfterBeforeParser = {
	pattern: () => /\b(\d+|a|one|two|three|four|five|six|seven|eight|nine|ten)\s+(year|years|decade|decades|century|centuries)\s+(after|before|since)\s+\w+/i,
	extract: (context: any, match: any) => {
		const refYear = context.refDate.getFullYear()
		const n = wordNumbers[match[1].toLowerCase()] ?? parseInt(match[1])
		if (isNaN(n)) return null
		const mult = unitMultipliers[match[2].toLowerCase()] ?? 1
		const dir = /before/i.test(match[3]) ? -1 : 1
		return {day: 1, month: 1, year: refYear + (n * mult * dir)}
	}
}

// "the rest of 496", "early 496", "mid 480" — bare number with BC polarity from anchor
export const restOfYearParser = {
	pattern: () => /\b(?:the\s+rest\s+of|the\s+end\s+of|the\s+start\s+of|the\s+beginning\s+of)\s+(\d{1,4})\b/i,
	extract: (context: any, match: any) => {
		const refYear = context.refDate.getFullYear()
		const rawYear = parseInt(match[1])
		if (refYear < 0) return {day: 1, month: 1, year: -rawYear}
		return {day: 1, month: 1, year: rawYear}
	}
}

// "Early in spring", "late winter", "mid autumn" — season with modifier
export const seasonWithModifierParser = {
	pattern: () => /\b(?:early|late|mid)\s+(?:in\s+)?(spring|summer|autumn|fall|winter)\b/i,
	extract: (context: any, match: any) => {
		const refYear = context.refDate.getFullYear()
		return {day: 1, month: seasonMonths[match[1].toLowerCase()] ?? 1, year: refYear}
	}
}

// Bare season (no preposition): "Spring", "Winter" — only in 2-pass context
export const bareSeasonParser = {
	pattern: () => /\b(spring|summer|autumn|fall|winter)\b/i,
	extract: (context: any, match: any) => {
		const refYear = context.refDate.getFullYear()
		const currentYear = new Date().getFullYear()
		// Only activate in 2-pass context (refDate differs from current year)
		if (refYear === currentYear) return null
		return {day: 1, month: seasonMonths[match[1].toLowerCase()] ?? 1, year: refYear}
	}
}

// Bare month in BC context: "mid-August", "September" — only when anchor is BC
export const bcMonthParser = {
	pattern: () => /\b(?:mid[- ]?)?(January|February|March|April|May|June|July|August|September|October|November|December)\b/i,
	extract: (context: any, match: any) => {
		const refYear = context.refDate.getFullYear()
		// Only activate for BC context — let chrono built-in handle AD months
		if (refYear >= 0) return null
		const monthName = match[1] || match[0].replace(/^mid[- ]?/i, "")
		return {day: 1, month: parseMonthName(monthName), year: refYear}
	}
}

export const standaloneYearParser = {
	pattern: () => /\b(\d{4})\b/i,
	extract: (_context: any, match: any) => {
		const year = parseInt(match[1])
		if (year < 1000 || year > 2099) return null
		return {day: 1, month: 1, year}
	}
}

export const prepositionYearParser = {
	pattern: () => /\b(in|at|on|from|to|year|by|since|until|around|circa|c\.|ca\.)\s+(\d{4})\b/i,
	extract: (_context: any, match: any) => ({day: 1, month: 1, year: parseInt(match[2])})
}

export const yyyyMmDdParser = {
	pattern: () => /\b(\d{4})[\/,-](\d{1,2})[\/,-](\d{1,3})\b/i,
	extract: (_context: any, match: any) => ({day: parseInt(match[3]), month: parseInt(match[2]), year: parseInt(match[1])})
}

export const mmDdYyyyParser = {
	pattern: () => /\b(\d{1,2})[\/,-](\d{1,2})[\/,-](\d{4})\b/i,
	extract: (_context: any, match: any) => ({day: parseInt(match[2]), month: parseInt(match[1]), year: parseInt(match[3])})
}

export const ddMonYyyyParser = {
	pattern: () => /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,7})\b/i,
	extract: (_context: any, match: any) => ({
		day: parseInt(match[1]),
		month: parseMonthName(match[2]),
		year: parseInt(match[3])
	})
}

export const monDdYyyyParser = {
	pattern: () => /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{4})\b/i,
	extract: (_context: any, match: any) => ({
		day: parseInt(match[2]),
		month: parseMonthName(match[1]),
		year: parseInt(match[3])
	})
}

export const yyyyMmParser = {
	pattern: () => /\b(\d{4})[\/,-](\d{1,2})\b/i,
	extract: (_context: any, match: any) => ({day: 1, month: parseInt(match[2]), year: parseInt(match[1])})
}

export const mmYyyyParser = {
	pattern: () => /\b(\d{1,2})[\/,-](\d{4})\b/i,
	extract: (_context: any, match: any) => ({day: 1, month: parseInt(match[1]), year: parseInt(match[2])})
}

export const monYyyyParser = {
	pattern: () => /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,7})\b/i,
	extract: (_context: any, match: any) => ({
		day: 1,
		month: parseMonthName(match[1]),
		year: parseInt(match[2])
	})
}

// Season + year: "the spring of 1916", "summer 1942"
export const seasonYearParser = {
	pattern: () => /\b(spring|summer|autumn|fall|winter)\s+(?:of\s+)?(\d{4})\b/i,
	extract: (_context: any, match: any) => ({
		day: 1,
		month: seasonMonths[match[1].toLowerCase()] ?? 1,
		year: parseInt(match[2])
	})
}

// Standalone season with article/preposition: "the summer", "in spring", "during the winter"
// Only produces results when a referenceDate provides the year (2-pass parsing)
export const seasonWithPrepositionParser = {
	pattern: () => /\b(?:the|in|during|during the|by)\s+(spring|summer|autumn|fall|winter)\b/i,
	extract: (context: any, match: any) => {
		const refYear = context.refDate.getFullYear()
		return {day: 1, month: seasonMonths[match[1].toLowerCase()] ?? 1, year: refYear}
	}
}

// early/late/mid + year: "early 1941", "late 1942", "mid-1943"
export const earlyLateYearParser = {
	pattern: () => /\b(early|late|mid|the\s+start\s+of|the\s+end\s+of|the\s+beginning\s+of)\s+-?(\d{4})\b/i,
	extract: (_context: any, match: any) => ({day: 1, month: 1, year: parseInt(match[2])})
}

// BC range pattern: "499-493 BC", "492-490 BCE" — extracts the first number as a BC date
export const bcRangeParser = {
	pattern: () => /\b(\d{1,4})\s*[-–]\s*\d{1,4}\s+(?:BC|BCE|B\.C\.?E?\.?)\b/i,
	extract: (_context: any, match: any) => ({year: -parseInt(match[1])})
}

// Refiner: correct month/season-only results in BC context
// Chrono's built-in month parser uses refDate but may compute wrong year
// (e.g., "September" with ref Jan 480 BC → Sep 481 BC instead of Sep 480 BC)
export const bcMonthRefiner = {
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
}

// ============================================================
// Japanese locale custom parsers
// ============================================================

// Imperial era → Gregorian year conversion table
// EraName: AD year of era year 1 (i.e., baseYear + eraNum = AD year)
const JA_ERA_BASE: Record<string, number> = {
	'明治': 1867, // 明治1年 = 1868
	'大正': 1911, // 大正1年 = 1912
	'昭和': 1925, // 昭和1年 = 1926
	'平成': 1988, // 平成1年 = 1989
	'令和': 2018, // 令和1年 = 2019
}

/**
 * Parses YYYY年MM月DD日 — handled by JPStandardParser already, but included for completeness.
 * Parses YYYY年MM月 (year + month, no day).
 * Pattern: e.g. "1917年10月" or "2024年3月"
 */
export const cjkYearMonthParser = {
	/**
	 * Parses YYYY年MM月 (year + month only). Full dates are excluded by the negative lookahead.
	 */
	pattern: () => /(\d{3,4})年(\d{1,2})月(?!\d{1,2}日)/,
	extract: (_context: any, match: RegExpMatchArray) => ({
		year: parseInt(match[1]),
		month: parseInt(match[2]),
		day: 1,
	}),
}

/**
 * Parses YYYY年 (year only, no following month).
 * Pattern: e.g. "1945年" or "2023年"
 */
export const cjkYearOnlyParser = {
	pattern: () => /(?<![0-9])(\d{3,4})年(?!\d{1,2}月)/,
	extract: (_context: any, match: RegExpMatchArray) => ({
		year: parseInt(match[1]),
		month: 1,
		day: 1,
	}),
}

/**
 * Parses Japanese imperial era years: 元号N年 → Gregorian AD year.
 * Also handles optional following 月 (month) and 日 (day).
 * e.g. "昭和18年1月" → 1943-01, "明治37年2月" → 1904-02
 */
export const jaEraYearParser = {
	// 元年 = gannen = first year of era (year 1)
	pattern: () => /(明治|大正|昭和|平成|令和)(元|\d{1,2})年(?:(\d{1,2})月(?:(\d{1,2})日)?)?/,
	extract: (_context: any, match: RegExpMatchArray) => {
		const eraName = match[1]
		const eraNum = match[2] === '元' ? 1 : parseInt(match[2])
		const base = JA_ERA_BASE[eraName]
		if (base === undefined) return null
		const year = base + eraNum
		const result: Record<string, number> = {year, month: 1, day: 1}
		if (match[3]) result.month = parseInt(match[3])
		if (match[4]) result.day = parseInt(match[4])
		return result
	},
}

/**
 * Parses BC years: 紀元前N年 → negative year.
 * e.g. "紀元前492年" → year: -492
 * Also handles optional month/day: "紀元前5世紀頃" is handled by century parser.
 */
export const jaKigenzenParser = {
	pattern: () => /紀元前(\d{1,4})年(?:(\d{1,2})月(?:(\d{1,2})日)?)?/,
	extract: (_context: any, match: RegExpMatchArray) => {
		const year = -parseInt(match[1])
		const result: Record<string, number> = {year, month: 1, day: 1}
		if (match[2]) result.month = parseInt(match[2])
		if (match[3]) result.day = parseInt(match[3])
		return result
	},
}

/**
 * Parses century expressions: N世紀 → midpoint year of that century.
 * e.g. "20世紀" → year: 1950, "紀元前6世紀" → year: -550
 * BC century: "紀元前N世紀" → midpoint negative year.
 */
export const jaCenturyParser = {
	pattern: () => /(紀元前)?(\d{1,2})世紀/,
	extract: (_context: any, match: RegExpMatchArray) => {
		const isBC = !!match[1]
		const century = parseInt(match[2])
		// Midpoint of century: century 20 → 1901-2000 → midpoint 1950
		const midpoint = (century - 1) * 100 + 50
		const year = isBC ? -midpoint : midpoint
		return {year, month: 1, day: 1}
	},
}

// === Chinese (ZH) custom parsers ===



// ─── German (DE) custom parsers ──────────────────────────────────────────────

const DE_MONTH_MAP: Record<string, number> = {
	januar: 1, februar: 2, märz: 3, april: 4, mai: 5, juni: 6,
	juli: 7, august: 8, september: 9, oktober: 10, november: 11, dezember: 12,
}

/**
 * Matches "MonthName Year" patterns in German, e.g. "Oktober 1999", "Januar 1943".
 * chrono-node/de does not handle these natively.
 */
const deMonthYearParser = {
	pattern: () => /(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s+(\d{4})/i,
	extract: (_context: any, match: RegExpMatchArray) => ({
		year: parseInt(match[2]),
		month: DE_MONTH_MAP[match[1].toLowerCase()],
		day: 1,
	}),
}

/**
 * Matches bare 4-digit years in German text, e.g. "1939", "1944".
 * chrono-node/de does not handle bare years natively.
 */
const bareYearParser = {
	pattern: () => /(?<![0-9])(\d{4})(?![0-9])/,
	extract: (_context: any, match: RegExpMatchArray) => {
		const year = parseInt(match[1])
		if (year < 1000 || year > 2099) return null
		return { year, month: 1, day: 1 }
	},
}

// ─── French (FR) custom parsers ───────────────────────────────────────────────

const FR_MONTH_MAP: Record<string, number> = {
	janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6,
	juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12,
}

/**
 * Matches "MonthName Year" patterns in French, e.g. "décembre 2001", "janvier 1943".
 * chrono-node/fr does not handle these natively.
 */
const frMonthYearParser = {
	pattern: () => /(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/i,
	extract: (_context: any, match: RegExpMatchArray) => ({
		year: parseInt(match[2]),
		month: FR_MONTH_MAP[match[1].toLowerCase()],
		day: 1,
	}),
}

/**
 * Matches bare 4-digit years in French text, e.g. "1939", "2001".
 * chrono-node/fr does not handle bare years natively.
 */




const zhCenturyParser = {
	pattern: () => /(公元前)?(\d{1,2})世[纪紀]/,
	extract: (_context: any, match: RegExpMatchArray) => {
		const isBC = !!match[1]
		const century = parseInt(match[2])
		// Midpoint of century: century 20 → 1901-2000 → midpoint 1950
		const midpoint = (century - 1) * 100 + 50
		const year = isBC ? -midpoint : midpoint
		return {year, month: 1, day: 1}
	},
}



const nlCenturyParser = {
	// Matches "20e eeuw", "21ste eeuw", "19de eeuw", "de 20e eeuw", etc.
	pattern: () => /\b(\d{1,2})(?:e|ste|de)?\s+eeuw\b/i,
	extract: (_context: any, match: RegExpMatchArray) => {
		const century = parseInt(match[1])
		// Midpoint of century: century 20 → 1901-2000 → midpoint 1950
		const midpoint = (century - 1) * 100 + 50
		return { year: midpoint, month: 1, day: 1 }
	},
}

const FRANC_TO_LOCALE: Record<string, string> = {
	deu: "de", fra: "fr", jpn: "ja", cmn: "zh",
	nld: "nl", vie: "vi", spa: "es", ita: "it", por: "pt",
};

export function detectLanguage(text: string): string {
	// CJK script detection first — franc needs more text to distinguish JA/ZH reliably
	if (/[\u3040-\u30ff]/.test(text)) return "ja";   // kana → always Japanese
	if (/[\u4e00-\u9fff]/.test(text)) return "zh";   // hanzi, no kana → Chinese
	const code = franc(text, { minLength: 10 });
	return FRANC_TO_LOCALE[code] ?? "en";
}

export default class HistoricaChrono {
	private _customChrono: Chrono | undefined;
	private _jaCustomChrono: Chrono | undefined;
	private _zhCustomChrono: Chrono | undefined;
	private _deCustomChrono: Chrono | undefined;
	private _frCustomChrono: Chrono | undefined;
	private _nlCustomChrono: Chrono | undefined
	private _viCustomChrono: Chrono | undefined

	setupCustomChrono(): Chrono {
		if (this._customChrono) return this._customChrono;
		const result = chrono.en.casual.clone()

		// Remove UnlikelyFormatFilter — it rejects bare year matches like "1939".
		// Our custom parsers already validate year ranges (1000-2099) to avoid false positives.
		result.refiners = result.refiners.filter(
			(r: any) => r.constructor.name !== "UnlikelyFormatFilter"
		)

		// === Relative temporal expression parsers (SUTime/HeidelTime-style) ===
		result.parsers.push(previousFollowingYearParser)
		result.parsers.push(nYearsLaterEarlierParser)
		result.parsers.push(nYearsAfterBeforeParser)

		// === BC-context propagation parsers ===
		result.parsers.push(restOfYearParser)
		result.parsers.push(seasonWithModifierParser)
		result.parsers.push(bareSeasonParser)
		result.parsers.push(bcMonthParser)

		// === Standard date format parsers ===
		result.parsers.push(standaloneYearParser)
		result.parsers.push(prepositionYearParser)
		result.parsers.push(yyyyMmDdParser)
		result.parsers.push(mmDdYyyyParser)
		result.parsers.push(ddMonYyyyParser)
		result.parsers.push(monDdYyyyParser)
		result.parsers.push(yyyyMmParser)
		result.parsers.push(mmYyyyParser)
		result.parsers.push(monYyyyParser)
		result.parsers.push(seasonYearParser)
		result.parsers.push(seasonWithPrepositionParser)
		result.parsers.push(earlyLateYearParser)
		result.parsers.push(bcRangeParser)

		// BCE patterns
		for (const pattern of BCEpattern) {
			result.parsers.push({
				pattern: () => pattern,
				extract: (_context: any, match: any) => ({year: -parseInt(match[1])})
			})
		}
		// AD patterns
		for (const pattern of ADpattern) {
			result.parsers.push({
				pattern: () => pattern,
				extract: (_context: any, match: any) => ({year: parseInt(match[1])})
			})
		}

		result.refiners.push(bcMonthRefiner)

		this._customChrono = result
		return this._customChrono
	}

	setupCustomChronoJa(): Chrono {
		if (this._jaCustomChrono) return this._jaCustomChrono;
		const result = chrono.ja.casual.clone()

		// Remove UnlikelyFormatFilter so bare year/era matches are not rejected
		result.refiners = result.refiners.filter(
			(r: any) => r.constructor.name !== "UnlikelyFormatFilter"
		)

		// Order matters: more-specific parsers first to avoid partial matches
		// 1. Imperial era (most specific — contains era name + year + optional month/day)
		result.parsers.unshift(jaKigenzenParser, jaEraYearParser)
		// 2. Century (BC and AD)
		result.parsers.push(jaCenturyParser)
		// 3. YYYY年MM月 (year+month, no day) — before year-only to avoid premature match
		result.parsers.push(cjkYearMonthParser)
		// 4. YYYY年 (year only, no following month)
		result.parsers.push(cjkYearOnlyParser)

		this._jaCustomChrono = result
		return this._jaCustomChrono
	}

	setupCustomChronoZh(): Chrono {
		if (this._zhCustomChrono) return this._zhCustomChrono;
		const result = chrono.zh.hans.casual.clone()

		// Remove UnlikelyFormatFilter so bare year matches are not rejected
		result.refiners = result.refiners.filter(
			(r: any) => r.constructor.name !== "UnlikelyFormatFilter"
		)

		// Order matters: more-specific parsers first to avoid partial matches
		// 1. Century (BC and AD) — 公元前N世纪 / N世纪 / N世紀
		result.parsers.push(zhCenturyParser)
		// 2. YYYY年MM月 (year+month, no day) — before year-only to avoid premature match
		result.parsers.push(cjkYearMonthParser)
		// 3. YYYY年 (year only, no following month)
		result.parsers.push(cjkYearOnlyParser)

		this._zhCustomChrono = result
		return this._zhCustomChrono
	}

	setupCustomChronoDe(): Chrono {
		if (this._deCustomChrono) return this._deCustomChrono;
		const result = chrono.de.casual.clone()

		// Remove UnlikelyFormatFilter so bare year and month-year matches are not rejected
		result.refiners = result.refiners.filter(
			(r: any) => r.constructor.name !== "UnlikelyFormatFilter"
		)

		// 1. "MonthName Year" — e.g. "Oktober 1999"
		result.parsers.push(deMonthYearParser)
		// 2. Bare 4-digit year — e.g. "1939"
		result.parsers.push(bareYearParser)

		this._deCustomChrono = result
		return this._deCustomChrono
	}

	setupCustomChronoFr(): Chrono {
		if (this._frCustomChrono) return this._frCustomChrono;
		const result = chrono.fr.casual.clone()

		// Remove UnlikelyFormatFilter so bare year and month-year matches are not rejected
		result.refiners = result.refiners.filter(
			(r: any) => r.constructor.name !== "UnlikelyFormatFilter"
		)

		// 1. "MonthName Year" — e.g. "décembre 2001"
		result.parsers.push(frMonthYearParser)
		// 2. Bare 4-digit year — e.g. "1939"
		result.parsers.push(bareYearParser)

		this._frCustomChrono = result
		return this._frCustomChrono
	}

	setupCustomChronoNl(): Chrono {
		if (this._nlCustomChrono) return this._nlCustomChrono;
		const result = chrono.nl.casual.clone()

		// Remove UnlikelyFormatFilter so bare year matches are not rejected
		result.refiners = result.refiners.filter(
			(r: any) => r.constructor.name !== "UnlikelyFormatFilter"
		)

		// 1. Century — "20e eeuw", "21ste eeuw", etc.
		result.parsers.push(nlCenturyParser)
		// 2. Bare 4-digit year — "1939"
		result.parsers.push(bareYearParser)

		this._nlCustomChrono = result
		return this._nlCustomChrono
	}

	setupCustomChronoVi(): Chrono {
		if (this._viCustomChrono) return this._viCustomChrono;
		const result = chrono.vi.casual.clone()

		// Remove UnlikelyFormatFilter so bare year matches are not rejected
		result.refiners = result.refiners.filter(
			(r: any) => r.constructor.name !== "UnlikelyFormatFilter"
		)

		// Bare 4-digit year — e.g. "1975"
		result.parsers.push(bareYearParser)

		this._viCustomChrono = result
		return this._viCustomChrono
	}

	getParserForLanguage(text: string, lang: string): Chrono {
		const resolved = lang === "auto" ? detectLanguage(text) : lang;
		switch (resolved) {
			case "de": return this.setupCustomChronoDe();
			case "fr": return this.setupCustomChronoFr();
			case "ja": return this.setupCustomChronoJa();
			case "zh": return this.setupCustomChronoZh();
			case "nl": return this.setupCustomChronoNl();
			case "vi": return this.setupCustomChronoVi();
			default:   return this.setupCustomChrono();
		}
	}
}

/**
 * Shared singleton for Japanese locale custom chrono.
 * Tests and plugin code can use `jaCustomChrono` directly to get the configured Chrono instance.
 */
const _chronoInstance = new HistoricaChrono()
export const jaCustomChrono: Chrono = _chronoInstance.setupCustomChronoJa()

export const zhCustomChrono: Chrono = _chronoInstance.setupCustomChronoZh()

export const deCustomChrono: Chrono = _chronoInstance.setupCustomChronoDe()

export const frCustomChrono: Chrono = _chronoInstance.setupCustomChronoFr()
export const nlCustomChrono: Chrono = _chronoInstance.setupCustomChronoNl()
export const viCustomChrono: Chrono = _chronoInstance.setupCustomChronoVi()
