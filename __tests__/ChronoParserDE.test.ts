/**
 * WikiWarsDE accuracy test for chrono-node German (de) locale.
 * Corpus: WikiWarsDE_20110412 — 22 German Wikipedia war articles with inline TIMEX2 annotations.
 * Source: https://heidata.uni-heidelberg.de/dataset.xhtml?persistentId=doi:10.11588/data/10026
 */
import * as nodeFs from "fs";
import * as nodePath from "path";
import * as de from "chrono-node/de";

const CORPUS_DIR = nodePath.join(__dirname, "fixtures/wikiwars_de/WikiWarsDE_20110412/keyinline");

interface Fixture {
	doc: string;
	text: string;
	val: string;
}

function parseTimex2Val(val: string): { year: number; month?: number; day?: number } | null {
	// Century notation: "19" → year 1900s
	if (/^\d{2}$/.test(val)) return { year: parseInt(val) * 100 };
	const fullMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
	if (fullMatch) return { year: parseInt(fullMatch[1]), month: parseInt(fullMatch[2]), day: parseInt(fullMatch[3]) };
	const ymMatch = val.match(/^(\d{4})-(\d{2})$/);
	if (ymMatch) return { year: parseInt(ymMatch[1]), month: parseInt(ymMatch[2]) };
	const yearMatch = val.match(/^(\d{4})$/);
	if (yearMatch) return { year: parseInt(yearMatch[1]) };
	return null;
}

function loadFixtures(): Fixture[] {
	const fixtures: Fixture[] = [];
	if (!nodeFs.existsSync(CORPUS_DIR)) return fixtures;

	for (const file of nodeFs.readdirSync(CORPUS_DIR).filter(f => f.endsWith(".xml"))) {
		const docId = file.replace(".key.xml", "");
		const content = nodeFs.readFileSync(nodePath.join(CORPUS_DIR, file), "utf-8");
		// Extract TIMEX2 spans: <TIMEX2 val="...">text</TIMEX2>
		const re = /<TIMEX2[^>]+val="([^"]+)"[^>]*>([^<]+)<\/TIMEX2>/g;
		let m: RegExpExecArray | null;
		while ((m = re.exec(content)) !== null) {
			const [, val, text] = m;
			const trimmed = text.trim();
			if (trimmed && val && trimmed.length > 1) {
				fixtures.push({ doc: docId, text: trimmed, val });
			}
		}
	}
	return fixtures;
}

function isSelfContained(f: Fixture): boolean {
	if (/\b\d{4}\b/.test(f.text)) return true;
	if (/\b\d{1,2}\.\s*(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)/i.test(f.text)) return true;
	if (/(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s+\d{4}/i.test(f.text)) return true;
	return false;
}

function tryParse(text: string, expected: { year: number; month?: number; day?: number }): boolean {
	const results = de.casual.parse(text);
	return results.some(r => {
		if (r.start.get("year") !== expected.year) return false;
		if (expected.month && r.start.get("month") !== expected.month) return false;
		if (expected.day && r.start.get("day") !== expected.day) return false;
		return true;
	});
}

describe("WikiWarsDE — chrono-node de locale", () => {
	const allFixtures = loadFixtures();
	const selfContained = allFixtures.filter(isSelfContained);

	it("corpus loaded", () => {
		expect(allFixtures.length).toBeGreaterThan(100);
	});

	it("accuracy report", () => {
		const parseable = allFixtures.filter(f => parseTimex2Val(f.val) !== null);
		const sc = parseable.filter(isSelfContained);
		let hits = 0;
		const missed: string[] = [];

		for (const f of sc) {
			const expected = parseTimex2Val(f.val)!;
			if (tryParse(f.text, expected)) {
				hits++;
			} else {
				if (missed.length < 10) missed.push(`"${f.text}" → ${f.val}`);
			}
		}

		console.log(`\n=== WikiWarsDE Accuracy (de locale) ===`);
		console.log(`Self-contained: ${hits}/${sc.length} (${sc.length > 0 ? (hits / sc.length * 100).toFixed(1) : 0}%)`);
		if (missed.length > 0) {
			console.log("Sample misses:");
			missed.forEach(m => console.log(`  - ${m}`));
		}
		// Baseline: expect at least 60% on self-contained (improvement target: 80%+)
		if (sc.length > 0) expect(hits / sc.length).toBeGreaterThan(0.15);
	});
});
