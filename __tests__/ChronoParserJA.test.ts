/**
 * Hand-curated Japanese date expression test for chrono-node Japanese (ja) locale.
 * Covers formal 年月日 patterns, relative expressions (昨日/今日/明日/来週), and weekday references.
 * No freely downloadable Japanese temporal corpus exists; fixtures are hand-curated.
 */
import * as ja from "chrono-node/ja";

interface Fixture { text: string; year?: number; month?: number; day?: number; label: string; }

// Reference date for relative expressions: 2026-04-12 (Sunday)
const REF = new Date(2026, 3, 12);

const FIXTURES: Fixture[] = [
	// Formal 年月日
	{ text: "1939年9月1日", year: 1939, month: 9, day: 1, label: "full date" },
	{ text: "2024年3月15日", year: 2024, month: 3, day: 15, label: "full date" },
	{ text: "2000年1月1日", year: 2000, month: 1, day: 1, label: "full date" },
	{ text: "1868年1月3日", year: 1868, month: 1, day: 3, label: "Meiji restoration" },
	{ text: "945年4月1日", year: 945, month: 4, day: 1, label: "ancient date" },
	// Year+Month only
	{ text: "2024年3月", year: 2024, month: 3, label: "year+month" },
	{ text: "1999年12月", year: 1999, month: 12, label: "year+month" },
	// Year only
	{ text: "1945年", year: 1945, label: "year only" },
	{ text: "2023年", year: 2023, label: "year only" },
	// Relative — requires REF
	{ text: "昨日", year: 2026, month: 4, day: 11, label: "yesterday" },
	{ text: "今日", year: 2026, month: 4, day: 12, label: "today" },
	{ text: "明日", year: 2026, month: 4, day: 13, label: "tomorrow" },
	// Weekday reference
	{ text: "月曜日", month: 4, label: "Monday (near)" },
	{ text: "金曜日", month: 4, label: "Friday (near)" },
	// ISO-style dates common in Japanese text
	{ text: "2024-03-15", year: 2024, month: 3, day: 15, label: "ISO date" },
];

function tryParse(text: string, expected: Fixture): boolean {
	const results = ja.casual.parse(text, REF);
	if (results.length === 0) return false;
	const r = results[0].start;
	if (expected.year !== undefined && r.get("year") !== expected.year) return false;
	if (expected.month !== undefined && r.get("month") !== expected.month) return false;
	if (expected.day !== undefined && r.get("day") !== expected.day) return false;
	return true;
}

describe("Japanese dates — chrono-node ja locale", () => {
	it("accuracy report", () => {
		let hits = 0;
		const missed: string[] = [];
		for (const f of FIXTURES) {
			if (tryParse(f.text, f)) hits++;
			else if (missed.length < 10) missed.push(`"${f.text}" [${f.label}]`);
		}
		console.log(`\n=== JA Accuracy (ja locale) ===`);
		console.log(`${hits}/${FIXTURES.length} (${(hits/FIXTURES.length*100).toFixed(1)}%)`);
		if (missed.length > 0) { console.log("Misses:"); missed.forEach(m => console.log(`  - ${m}`)); }
		expect(hits / FIXTURES.length).toBeGreaterThan(0.5);
	});
});
