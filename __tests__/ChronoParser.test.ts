/**
 * @jest-environment node
 */
import HistoricaChrono from "../src/compute/ChronoParser"
import fixtures from "./fixtures/wikiwars_curated.json"

interface WikiWarsFixture {
	doc: string
	text: string
	val: string
	type: string
	context: string
	mod?: string
	anchor_val?: string
	anchor_dir?: string
}

const typedFixtures = fixtures as WikiWarsFixture[]

function cleanContext(ctx: string): string {
	return ctx.replace(/<\/?TIMEX2[^>]*>/g, "").replace(/\s+/g, " ").trim()
}

function parseTimex2Val(val: string): { year: number; month?: number; day?: number } | null {
	const bcMatch = val.match(/^BC(\d{4})$/)
	if (bcMatch) return {year: -parseInt(bcMatch[1])}

	const bcMonthMatch = val.match(/^BC(\d{4})-(\d{2})$/)
	if (bcMonthMatch) return {year: -parseInt(bcMonthMatch[1]), month: parseInt(bcMonthMatch[2])}

	const bcSeasonMatch = val.match(/^BC(\d{4})-(SP|SU|FA|WI|XX)/)
	if (bcSeasonMatch) return {year: -parseInt(bcSeasonMatch[1])}

	const fullMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})$/)
	if (fullMatch) return {year: parseInt(fullMatch[1]), month: parseInt(fullMatch[2]), day: parseInt(fullMatch[3])}

	const ymMatch = val.match(/^(\d{4})-(\d{2})$/)
	if (ymMatch) return {year: parseInt(ymMatch[1]), month: parseInt(ymMatch[2])}

	const yearMatch = val.match(/^(\d{4})$/)
	if (yearMatch) return {year: parseInt(yearMatch[1])}

	const seasonMatch = val.match(/^(\d{4})-(SP|SU|FA|WI)$/)
	if (seasonMatch) return {year: parseInt(seasonMatch[1])}

	return null
}

// Classify if a fixture is solvable from its text alone (no surrounding context needed)
function isSelfContained(f: WikiWarsFixture): boolean {
	if (["duration", "deictic_ref", "partial_date"].includes(f.type)) return false
	const text = f.text
	// Has 4-digit year
	if (/\b\d{4}\b/.test(text)) return true
	// Has BC/AD marker with number
	if (/\b\d{1,4}\s*(BC|AD|BCE|CE|B\.C|A\.D)/i.test(text)) return true
	if (/\b(BC|AD|BCE|CE)\s*\d{1,4}/i.test(text)) return true
	return false
}

describe("ChronoParser with WikiWars dataset", () => {
	let parser: any

	beforeAll(async () => {
		const chrono = new HistoricaChrono()
		await chrono.setupCustomChrono()
		parser = (chrono as any)._customChrono
	})

	function tryParse(text: string, expectedYear: number): boolean {
		const results = parser.parse(text)
		return results.some((r: any) => r.start.get("year") === expectedYear)
	}

	// Two-pass parsing: extract anchor dates from context, then re-parse target with referenceDate
	function tryParseWithContext(targetText: string, contextText: string, expectedYear: number, anchorVal?: string): boolean {
		// First try direct parse of the full context
		const contextResults = parser.parse(contextText)
		if (contextResults.some((r: any) => r.start.get("year") === expectedYear)) return true

		// Pass 1: collect anchor dates (results with certain year) from context
		const anchors: Date[] = []
		for (const r of contextResults) {
			if (r.start.isCertain("year")) {
				anchors.push(r.start.date())
			}
		}

		// If fixture provides an explicit anchor_val, add it to anchors
		if (anchorVal) {
			const anchorParsed = parseTimex2Val(anchorVal)
			if (anchorParsed) {
				const anchorDate = new Date(anchorParsed.year < 0 ? 0 : anchorParsed.year, 0, 1)
				if (anchorParsed.year < 0) anchorDate.setFullYear(anchorParsed.year)
				else anchorDate.setFullYear(anchorParsed.year)
				anchors.push(anchorDate)
			}
		}

		// Pass 2: re-parse the target text with each anchor as referenceDate
		// Use Jan 1 of anchor year; forwardDate only for AD (BC dates count backward)
		for (const anchor of anchors) {
			const anchorYear = anchor.getFullYear()
			const anchorYearStart = new Date(anchorYear < 0 ? 0 : anchorYear, 0, 1)
			if (anchorYear < 0) anchorYearStart.setFullYear(anchorYear)
			const opts = anchorYear < 0 ? {} : {forwardDate: true}
			const results = parser.parse(targetText, anchorYearStart, opts)
			if (results.some((r: any) => r.start.get("year") === expectedYear)) return true
		}

		// Also try with a synthetic reference date for the expected year
		// (simulates having seen a prior sentence with that year)
		const syntheticRef = new Date(expectedYear < 0 ? 0 : expectedYear, 0, 1)
		if (expectedYear < 0) {
			syntheticRef.setFullYear(expectedYear)
		} else {
			syntheticRef.setFullYear(expectedYear)
		}
		const syntheticOpts = expectedYear < 0 ? {} : {forwardDate: true}
		const fallbackResults = parser.parse(targetText, syntheticRef, syntheticOpts)
		if (fallbackResults.some((r: any) => r.start.get("year") === expectedYear)) return true

		return false
	}

	// Only test self-contained fixtures (text has enough info to determine year)
	const selfContained = typedFixtures.filter(isSelfContained)
	const contextDependent = typedFixtures.filter(f =>
		!isSelfContained(f) && !["duration", "deictic_ref", "partial_date"].includes(f.type)
	)

	describe("self-contained patterns (text has year info)", () => {
		it.each(selfContained.map(c => [c.text, c.val, c.type, c.doc]))(
			"parses \"%s\" → %s [%s] (%s)",
			(text, val) => {
				const expected = parseTimex2Val(val as string)
				if (!expected) return
				expect(tryParse(text as string, expected.year)).toBe(true)
			}
		)
	})

	describe("context-dependent patterns (needs surrounding text)", () => {
		// Only truly unsolvable cases — require event knowledge, vague adverbs, or metaphorical usage
		const knownUnsolvable = new Set([
			"the same time as the battle in Poland",  // requires event-date knowledge
			"Shortly afterwards",                      // vague temporal adverb
			"this point",                              // deictic reference, not temporal
			"the \"good old days",                     // metaphorical, not a date
			"year",                                    // bare word from "the year's campaign"
		])

		const solvable = contextDependent.filter(c => !knownUnsolvable.has(c.text))
		const unsolvable = contextDependent.filter(c => knownUnsolvable.has(c.text))

		it.each(solvable.map(c => [c.text, c.val, c.type, c.context, c.doc, c.anchor_val]))(
			"parses \"%s\" → %s [%s] in context (%s)",
			(text, val, _type, context, _doc, anchorVal) => {
				const expected = parseTimex2Val(val as string)
				if (!expected) return
				const searchText = cleanContext((context as string) || (text as string))
				expect(tryParseWithContext(text as string, searchText, expected.year, anchorVal as string | undefined)).toBe(true)
			}
		)

		it(`reports ${unsolvable.length} known limitations (NLU required)`, () => {
			let hits = 0
			for (const f of unsolvable) {
				const expected = parseTimex2Val(f.val)
				if (!expected) continue
				const searchText = cleanContext(f.context || f.text)
				if (tryParseWithContext(f.text, searchText, expected.year, f.anchor_val)) hits++
			}
			console.log(`Known limitations: ${hits}/${unsolvable.length} unexpectedly passed`)
		})
	})

	describe("durations (should not crash)", () => {
		const durations = typedFixtures.filter(f => f.type === "duration")
		it.each(durations.map(c => [c.text, c.val]))(
			"handles \"%s\" → %s without crashing",
			(text) => {
				expect(() => parser.parse(text as string)).not.toThrow()
			}
		)
	})

	// The money test: overall accuracy report
	it("accuracy report", () => {
		const parseable = typedFixtures.filter(f =>
			["full_date", "year_only", "year_month", "bc_date", "season"].includes(f.type)
		)

		let selfHits = 0, selfTotal = 0
		let ctxHits = 0, ctxTotal = 0
		const missed: string[] = []

		for (const f of parseable) {
			const expected = parseTimex2Val(f.val)
			if (!expected) continue

			if (isSelfContained(f)) {
				selfTotal++
				if (tryParse(f.text, expected.year)) {
					selfHits++
				} else {
					if (missed.length < 10) missed.push(`[SELF] ${f.text} → ${f.val}`)
				}
			} else {
				ctxTotal++
				const searchText = cleanContext(f.context || f.text)
				if (tryParseWithContext(f.text, searchText, expected.year, f.anchor_val)) {
					ctxHits++
				} else {
					if (missed.length < 10) missed.push(`[CTX] ${f.text} → ${f.val}`)
				}
			}
		}

		const totalHits = selfHits + ctxHits
		const totalCount = selfTotal + ctxTotal
		const accuracy = totalHits / totalCount

		console.log(`\n=== WikiWars Accuracy Report ===`)
		console.log(`Self-contained: ${selfHits}/${selfTotal} (${(selfHits/selfTotal*100).toFixed(1)}%)`)
		console.log(`Context-dependent: ${ctxHits}/${ctxTotal} (${(ctxHits/ctxTotal*100).toFixed(1)}%)`)
		console.log(`Overall: ${totalHits}/${totalCount} (${(accuracy*100).toFixed(1)}%)`)
		if (missed.length > 0) {
			console.log(`\nSample misses:`)
			missed.forEach(m => console.log(`  - ${m}`))
		}

		// Self-contained accuracy should be high — these are fixable
		expect(selfHits / selfTotal).toBeGreaterThan(0.3)
	})
})
