/**
 * WikiWars-JA accuracy test for HistoricaChrono JA locale.
 * Corpus: 1770 annotated date expressions extracted from 22 Japanese Wikipedia war articles.
 * Each fixture has a surface text, ground-truth val, type, and context sentence.
 *
 * Same structure as ChronoParser.test.ts (WikiWars EN).
 * Ground truth was computed algorithmically from surface forms:
 *   - YYYY年MM月DD日 → val="YYYY-MM-DD"
 *   - 昭和N年 → val=Gregorian year via era table
 *   - 紀元前N年 → val="BCNNNN"
 *   - N世紀 → val=century midpoint year
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { jaCustomChrono } from "../src/compute/ChronoParser";
import type { Chrono } from "@nhannht/chrono-node";

const FIXTURE_FILE = join(__dirname, "fixtures/wikiwars_ja_curated.json");

interface Fixture {
	doc: string;
	text: string;
	val: string;
	type: string;
	context: string;
}

function parseVal(val: string): { year: number; month?: number; day?: number } | null {
	const bc = val.match(/^BC(\d{4})(?:-(\d{2}))?$/);
	if (bc) return { year: -parseInt(bc[1]), month: bc[2] ? parseInt(bc[2]) : undefined };
	const full = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (full) return { year: parseInt(full[1]), month: parseInt(full[2]), day: parseInt(full[3]) };
	const ym = val.match(/^(\d{4})-(\d{2})$/);
	if (ym) return { year: parseInt(ym[1]), month: parseInt(ym[2]) };
	const y = val.match(/^(\d{4})$/);
	if (y) return { year: parseInt(y[1]) };
	return null;
}

function loadFixtures(): Fixture[] {
	if (!existsSync(FIXTURE_FILE)) return [];
	return JSON.parse(readFileSync(FIXTURE_FILE, "utf-8"));
}

describe("WikiWars-JA — HistoricaChrono JA locale", () => {
	const fixtures = loadFixtures();

	it("fixtures loaded", () => {
		expect(fixtures.length).toBeGreaterThan(100);
	});

	it("accuracy report", async () => {
		const parser: Chrono = jaCustomChrono;

		const byType: Record<string, { hits: number; total: number }> = {};
		const missed: string[] = [];
		let totalHits = 0, totalCount = 0;

		for (const f of fixtures) {
			const expected = parseVal(f.val);
			if (!expected) continue;

			const results = parser.parse(f.text);
			const hit = results.some(r => {
				if (r.start.get("year") !== expected.year) return false;
				if (expected.month !== undefined && r.start.get("month") !== expected.month) return false;
				if (expected.day !== undefined && r.start.get("day") !== expected.day) return false;
				return true;
			});

			const bucket = byType[f.type] ?? { hits: 0, total: 0 };
			bucket.total++;
			if (hit) { bucket.hits++; totalHits++; }
			else if (missed.length < 10) missed.push(`[${f.type}] "${f.text}" → ${f.val}`);
			byType[f.type] = bucket;
			totalCount++;
		}

		console.log(`\n=== WikiWars-JA Accuracy (HistoricaChrono JA) ===`);
		console.log(`Overall: ${totalHits}/${totalCount} (${(totalHits / totalCount * 100).toFixed(1)}%)`);
		for (const [type, { hits, total }] of Object.entries(byType).sort((a, b) => b[1].total - a[1].total)) {
			console.log(`  ${type}: ${hits}/${total} (${(hits / total * 100).toFixed(1)}%)`);
		}
		if (missed.length > 0) {
			console.log("Sample misses:");
			missed.forEach(m => console.log(`  - ${m}`));
		}

		expect(totalHits / totalCount).toBeGreaterThan(0.5);
	});
});
