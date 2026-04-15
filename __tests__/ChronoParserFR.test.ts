/**
 * FTiB (French TimeBank) accuracy test for chrono-node French (fr) locale.
 * Corpus: 108 French news articles (Est Républicain/CNRTL) with ISO-TimeML TIMEX3 annotations.
 * Source: https://github.com/ddenz/FR-TimeBank
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { frCustomChrono } from "../src/compute/ChronoParser";

const CORPUS_DIR = join(__dirname, "fixtures/ftib");

interface Fixture { doc: string; text: string; val: string; }

function parseTimex3Val(val: string): { year: number; month?: number; day?: number } | null {
	const full = val.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
	if (full) return { year: +full[1], month: +full[2], day: +full[3] };
	const ym = val.match(/^(\d{4})-(\d{2})$/);
	if (ym) return { year: +ym[1], month: +ym[2] };
	const y = val.match(/^(\d{4})$/);
	if (y) return { year: +y[1] };
	return null;
}

function loadFixtures(): Fixture[] {
	const out: Fixture[] = [];
	if (!existsSync(CORPUS_DIR)) return out;
	const seen = new Set<string>();
	for (const file of readdirSync(CORPUS_DIR).filter(f => f.endsWith(".tml"))) {
		const doc = file.replace(".tml", "");
		const content = readFileSync(join(CORPUS_DIR, file), "utf-8");
		for (const re of [
			/<TIMEX3[^>]+type="DATE"[^>]+value="([^"]+)"[^>]*>([^<]+)<\/TIMEX3>/g,
			/<TIMEX3[^>]+value="([^"]+)"[^>]+type="DATE"[^>]*>([^<]+)<\/TIMEX3>/g,
		]) {
			let m: RegExpExecArray | null;
			while ((m = re.exec(content)) !== null) {
				const [, val, text] = m;
				const t = text.trim();
				const key = `${doc}::${t}::${val}`;
				if (t && val && t.length > 1 && !seen.has(key)) { seen.add(key); out.push({ doc, text: t, val }); }
			}
		}
	}
	return out;
}

function isSelfContained(f: Fixture): boolean {
	// Only expressions carrying a 4-digit year are self-contained (day+month alone needs context)
	return /\b\d{4}\b/.test(f.text);
}

function tryParse(text: string, expected: { year: number; month?: number; day?: number }): boolean {
	const parser = frCustomChrono;
	return parser.parse(text).some(r => {
		if (r.start.get("year") !== expected.year) return false;
		if (expected.month && r.start.get("month") !== expected.month) return false;
		if (expected.day && r.start.get("day") !== expected.day) return false;
		return true;
	});
}

describe("FTiB — chrono-node fr locale", () => {
	const allFixtures = loadFixtures();

	it("corpus loaded", () => { expect(allFixtures.length).toBeGreaterThan(10); });

	it("accuracy report", async () => {
		const sc = allFixtures.filter(isSelfContained).filter(f => parseTimex3Val(f.val));
		let hits = 0;
		const missed: string[] = [];
		for (const f of sc) {
			if (tryParse(f.text, parseTimex3Val(f.val)!)) hits++;
			else if (missed.length < 10) missed.push(`"${f.text}" → ${f.val}`);
		}
		console.log(`\n=== FTiB Accuracy (fr locale) ===`);
		console.log(`Self-contained: ${hits}/${sc.length} (${sc.length > 0 ? (hits/sc.length*100).toFixed(1) : 0}%)`);
		if (missed.length > 0) { console.log("Sample misses:"); missed.forEach(m => console.log(`  - ${m}`)); }
		if (sc.length > 0) expect(hits / sc.length).toBeGreaterThan(0.1);
	});
});
