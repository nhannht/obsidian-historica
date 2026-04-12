/**
 * Hand-curated Chinese date expression test for chrono-node zh.hans locale.
 * TempEval-2 ZH corpus is GBK-encoded and unusable as UTF-8; fixtures are hand-curated instead.
 * Known gap: N天前 / N小时前 relative expressions not supported (chrono-node issue #587).
 */
import * as zh from "chrono-node/zh";

interface Fixture { text: string; year?: number; month?: number; day?: number; label: string; }

// Reference date: 2026-04-12
const REF = new Date(2026, 3, 12);

const FIXTURES: Fixture[] = [
	// Formal 年月日
	{ text: "1939年9月1日", year: 1939, month: 9, day: 1, label: "full date" },
	{ text: "2024年3月15日", year: 2024, month: 3, day: 15, label: "full date" },
	{ text: "1949年10月1日", year: 1949, month: 10, day: 1, label: "founding of PRC" },
	{ text: "2000年1月1日", year: 2000, month: 1, day: 1, label: "millennium" },
	// Year+Month
	{ text: "2024年3月", year: 2024, month: 3, label: "year+month" },
	{ text: "1999年12月", year: 1999, month: 12, label: "year+month" },
	// Year only
	{ text: "1945年", year: 1945, label: "year only" },
	{ text: "2023年", year: 2023, label: "year only" },
	// Numeric date formats common in Chinese text
	{ text: "1996-03-28", year: 1996, month: 3, day: 28, label: "ISO date" },
	{ text: "2024/03/15", year: 2024, month: 3, day: 15, label: "slash date" },
	// Relative (known gaps — documented below)
	{ text: "昨天", year: 2026, month: 4, day: 11, label: "yesterday" },
	{ text: "今天", year: 2026, month: 4, day: 12, label: "today" },
	{ text: "明天", year: 2026, month: 4, day: 13, label: "tomorrow" },
];

// These are KNOWN GAPS in zh.hans locale — documented as failing
const KNOWN_GAPS = [
	{ text: "3天前", label: "3 days ago — issue #587" },
	{ text: "1小时前", label: "1 hour ago — issue #587" },
	{ text: "上个月", label: "last month" },
	{ text: "下个星期", label: "next week" },
];

function tryParse(text: string, expected: Fixture): boolean {
	const results = zh.hans.casual.parse(text, REF);
	if (results.length === 0) return false;
	const r = results[0].start;
	if (expected.year !== undefined && r.get("year") !== expected.year) return false;
	if (expected.month !== undefined && r.get("month") !== expected.month) return false;
	if (expected.day !== undefined && r.get("day") !== expected.day) return false;
	return true;
}

describe("Chinese dates — chrono-node zh.hans locale", () => {
	describe("known gaps (assert current failure, will fix in task 136)", () => {
		it.each(KNOWN_GAPS.map(g => [g.text, g.label]))(
			'"%s" not yet supported [%s]',
			(text) => {
				const results = zh.hans.casual.parse(text as string, REF);
				console.log(`  zh gap: "${text}" → ${results.length ? JSON.stringify(results[0].start.knownValues) : "null"}`);
				expect(results.length).toBe(0);
			}
		);
	});

	it("accuracy report", () => {
		let hits = 0;
		const missed: string[] = [];
		for (const f of FIXTURES) {
			if (tryParse(f.text, f)) hits++;
			else if (missed.length < 10) missed.push(`"${f.text}" [${f.label}]`);
		}
		console.log(`\n=== ZH Accuracy (zh.hans locale) ===`);
		console.log(`${hits}/${FIXTURES.length} (${(hits/FIXTURES.length*100).toFixed(1)}%)`);
		if (missed.length > 0) { console.log("Misses:"); missed.forEach(m => console.log(`  - ${m}`)); }
		expect(hits / FIXTURES.length).toBeGreaterThan(0.5);
	});
});
