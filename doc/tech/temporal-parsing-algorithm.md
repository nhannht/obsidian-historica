# Temporal Parsing Algorithm

Technical documentation for Historica's date/time extraction system. This describes the algorithms and strategies used to parse temporal expressions from natural language text, including support for BC/BCE dates, relative temporal expressions, and context-dependent date resolution.

## Architecture Overview

The temporal parsing pipeline has three layers:

```
Markdown Text
     |
     v
[MarkdownParser] --- remark/unified AST + Intl.Segmenter sentence splitting
     |
     v
[ChronoParser]   --- date extraction (chrono-node + custom parsers + refiners)
     |
     v
[PlotUnit[]]     --- structured timeline data with timestamps
```

**Key files:**
- `src/compute/MarkdownParser.ts` — sentence extraction + fixed-point temporal resolution
- `src/compute/ChronoParser.ts` — chrono-node configuration with custom parsers

## Sentence Tokenization

We use [`Intl.Segmenter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) (ECMAScript 2022) for sentence boundary detection. This is a built-in JavaScript API backed by the ICU (International Components for Unicode) library — the same engine used by macOS, Android, and Chrome for text segmentation.

```typescript
const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
const sentences = Array.from(segmenter.segment(text), s => s.segment.trim())
    .filter(s => s.length > 0);
```

### Why Intl.Segmenter over natural.js

Previously, Historica used `natural.SentenceTokenizer` from the [natural](https://github.com/NaturalNode/natural) NLP library. It was replaced for three reasons:

**1. Correctness** — natural.js mishandles abbreviations critical to historical text:

| Input | natural.js | Intl.Segmenter |
|-------|-----------|----------------|
| "In 500 B.C. the Greeks fought." | "In 500 B." / "C." / "the Greeks fought." | "In 500 B.C. the Greeks fought." |
| "Events of A.D. 476 marked..." | "Events of A." / "D." / "476 marked..." | "Events of A.D. 476 marked..." |
| "On Sept. 1, 1939, war began." | "On Sept." / "1, 1939, war began." | "On Sept. 1, 1939, war began." |
| "The U.S. entered WWII." | "The U." / "S." / "entered WWII." | "The U.S. entered WWII." |

Splitting "B.C." and "A.D." into fragments destroys date parsing downstream — chrono-node receives "C. the Greeks fought" instead of the full sentence with the era marker.

**2. Performance** — natural.js has O(n^2) scaling:

| Sentences | natural.js | Intl.Segmenter | Speedup |
|-----------|-----------|----------------|---------|
| 100 | 25ms | 0.2ms | 125x |
| 1,000 | 1,869ms | 0.9ms | 2,077x |
| 3,000 | 17,247ms | 2.6ms | 6,634x |

**3. Bundle size** — natural.js adds ~500KB to the bundle for a single function. `Intl.Segmenter` is built into the JavaScript runtime (zero bundle cost). Removing natural.js reduced the plugin bundle from 2.7MB to 2.5MB.

### Runtime Compatibility

`Intl.Segmenter` is available in all environments Obsidian targets:
- Electron (Chromium) — since Chrome 87 (2020)
- Node.js 16+ / Bun
- Safari 15.4+, Firefox 125+

No polyfill is needed for an Obsidian plugin.

## chrono-node Foundation

We build on [chrono-node](https://github.com/wanasit/chrono) v2.x, a natural language date parser for JavaScript. We clone `chrono.en.casual` and extend it with:

1. **Removal of `UnlikelyFormatFilter`** — chrono's built-in filter rejects bare year patterns like "1939". Our custom parsers validate year ranges (1000-2099) to avoid false positives, making the filter unnecessary.

2. **Custom parsers** — regex-based pattern matchers registered via `chrono.parsers.push()`. Each parser has:
   - `pattern()` — returns a `RegExp` to match against text
   - `extract(context, match)` — returns `{year, month?, day?}` or `null` to reject

3. **Custom refiners** — post-processing steps registered via `chrono.refiners.push()` that adjust results after all parsers run.

## Parser Categories

### Standard Date Format Parsers

These handle explicit, self-contained date expressions:

| Parser | Pattern | Example |
|--------|---------|---------|
| Bare 4-digit year | `\b(\d{4})\b` (1000-2099 only) | "1939" |
| Preposition + year | `\b(in\|circa\|ca\.)\s+(\d{4})\b` | "in 1941", "circa 1500" |
| YYYY/MM/DD | `\b(\d{4})[/,-](\d{1,2})[/,-](\d{1,3})\b` | "1941-06-22" |
| MM/DD/YYYY | `\b(\d{1,2})[/,-](\d{1,2})[/,-](\d{4})\b` | "12/07/1941" |
| dd Mon YYYY | `\b(\d{1,2})\s+(Jan\|...\|Dec)\s+(\d{1,7})\b` | "1 Sep 1939" |
| Mon dd YYYY | `\b(Jan\|...\|Dec)\s+(\d{1,2})\s+(\d{4})\b` | "September 1, 1939" |
| YYYY/MM | `\b(\d{4})[/,-](\d{1,2})\b` | "1939-09" |
| Mon YYYY | `\b(Jan\|...\|Dec)\s+(\d{1,7})\b` | "September 1939" |
| Season + year | `\b(spring\|summer\|...)\s+(\d{4})\b` | "summer 1942" |
| Early/late/mid + year | `\b(early\|late\|mid)\s+(\d{4})\b` | "early 1941" |

### BC/BCE Date Parsers

Historical dates use negative year values internally (e.g., 499 BC = year `-499`):

| Parser | Pattern | Example |
|--------|---------|---------|
| N BC/BCE | `\b(\d{1,4})\s+B\.?C\.?E?\.?\b` | "499 BC", "480 BCE" |
| BC/BCE N | `\bB\.?C\.?E?\.?:?\s+(\d{1,4})\b` | "BCE: 499" |
| N Before Christ | `\b(\d{1,4})\s+Before\s+\w{1,2}\s+Christ\b` | "499 Before Christ" |
| BC range | `\b(\d{1,4})\s*[-–]\s*\d{1,4}\s+BC\b` | "499-493 BC" (extracts first) |
| AD/CE variants | `\b(\d{1,4})\s+A\.?D\.?E?\.?\b` | "1066 AD" |

### Relative Temporal Expression Parsers

Inspired by SUTime (Stanford) and HeidelTime (Heidelberg), these resolve relative expressions using arithmetic on the reference date's year. The reference date comes from the 2-pass system (see below).

All arithmetic is uniform for BC/AD because JavaScript's `Date.getFullYear()` returns negative values for BC dates:

```
"the following year" from BC 492 (year=-492):  -492 + 1 = -491 (BC 491)
"a decade earlier"  from BC 490 (year=-490):   -490 - 10 = -500 (BC 500)
```

| Parser | Pattern | Logic |
|--------|---------|-------|
| Previous/following year | `\b(?:the\s+)?(previous\|following\|next)\s+year\b` | refYear +/- 1 |
| N units earlier/later | `\b(?:just\s+)?(\d+\|a\|one\|...)\s+(year\|decade\|century)(s?)\s+(earlier\|later)\b` | refYear +/- (N * multiplier) |
| N units after/before X | `\b(\d+\|a\|one\|...)\s+(year\|decade)(s?)\s+(after\|before)\s+\w+` | Same arithmetic; event name ignored |

**Number words supported:** a, one, two, three, four, five, six, seven, eight, nine, ten.
**Unit multipliers:** year=1, decade=10, century=100.

### BC-Context Propagation Parsers

When the 2-pass system establishes a BC anchor (negative refYear), these parsers inherit the BC polarity for expressions that lack explicit era markers:

| Parser | Pattern | Guard | Example |
|--------|---------|-------|---------|
| Qualifier + bare number | `\b(?:the\s+rest\s+of\|early\|late\|mid)\s+(\d{1,4})\b` | if refYear < 0: negate | "the rest of 496" in BC section |
| Early/mid/late + season | `\b(?:early\|late\|mid)\s+(?:in\s+)?(spring\|...)\b` | Uses refYear | "Early in spring" |
| Bare season | `\b(spring\|summer\|autumn\|fall\|winter)\b` | Only if refYear != current year | "Spring" in historical narrative |
| Standalone season + article | `\b(?:the\|in\|during)\s+(spring\|summer\|...)\b` | Uses refYear | "the summer", "during the winter" |
| Bare month (BC only) | `\b(?:mid[- ]?)?(January\|...\|December)\b` | Only if refYear < 0 | "September" in BC section |

**False positive guards:**
- Bare season parser only activates when `refYear !== new Date().getFullYear()` — this means it only fires during 2-pass re-parsing, not on first parse where refDate defaults to today.
- Bare month BC parser only activates when `refYear < 0` — chrono's built-in month parser handles AD dates correctly.

## BC Year Refiner

A post-processing refiner corrects chrono's built-in month parser behavior in BC context. The problem: chrono's built-in parses "September" with ref=Jan 480 BC and returns Sep 481 BC (going backward). The refiner forces the anchor year:

```typescript
refine(context, results) {
    const refYear = context.refDate.getFullYear()
    if (refYear >= 0) return results  // AD: no correction needed
    for (const r of results) {
        if (!r.start.isCertain("year") && r.start.get("year") !== refYear) {
            r.start.assign("year", refYear)
        }
    }
    return results
}
```

This only affects results where the year was **implied** (not explicit). Results with `isCertain("year") === true` are never modified.

## Fixed-Point Temporal Resolution

The core algorithm for context-dependent date resolution. Implemented in `MarkdownParser.ExtractValidSentencesFromFile()`.

### Problem

Many historical texts mention dates without explicit years, and references can point both forward and backward:

> *"The previous year, tensions had been rising. The Battle of Marathon took place in 490 BC. The following year, the Greeks celebrated."*

- "The following year" must resolve to 489 BC using the prior anchor (forward reference)
- "The previous year" must resolve to 491 BC using a later anchor (backward reference)
- A simple forward-only pass cannot resolve backward references

### Why Fixed-Point

| Strategy | Forward refs | Backward refs | Chains | Complexity |
|----------|-------------|---------------|--------|------------|
| 2-pass (forward only) | Yes | No | Yes (rolling) | Simple |
| 3-pass (forward + backward) | Yes | Yes | Mostly | Medium |
| **Fixed-point (iterate until stable)** | **Yes** | **Yes** | **All** | **Simple + complete** |

A fixed-point algorithm repeats forward+backward passes until no result changes. It is mathematically guaranteed to converge because:
1. Each pass can only add or correct dates (never remove information)
2. The number of sentences is finite
3. Self-contained parsers produce identical results regardless of anchor

In practice, convergence always occurs in **2 iterations** — the first does the real work, the second confirms stability. A safety cap of 5 iterations prevents pathological cases.

### Algorithm

**Initial Parse (no context)**

Parse all sentences without any reference date. Self-contained dates ("490 BC", "July 14, 1789") are resolved immediately. Relative expressions ("the following year") get a wrong default (current year).

**Fixed-Point Loop**

```
repeat (max 5 times):
    changed = false

    // Forward pass: propagate anchors left-to-right
    anchor = null
    for each sentence (left to right):
        if anchor exists:
            re-parse sentence with anchor as referenceDate
            if results changed: mark changed
        update anchor from results with certain year

    // Backward pass: fill gaps only
    // Only re-parse sentences the forward pass couldn't reach
    // (those before the first explicit date in the paragraph)
    anchor = null
    for each sentence (right to left):
        if anchor exists AND sentence had no forward anchor:
            re-parse sentence with anchor as referenceDate
            if results changed: mark changed
        update anchor from results with certain year

    if not changed: break  // fixed point reached
```

**Why the backward pass only fills gaps:**

The forward pass is authoritative for relative expressions. "The following year" means "after the most recently mentioned date in reading order" — that's a forward reference by definition. If the backward pass were allowed to override forward results, it would use anchors from sentences that appear *after* in reading order, producing wrong results.

The backward pass exists solely to resolve sentences that appear *before* any explicit date — cases where no forward anchor was available.

### Trace Example

```
Paragraph: "The previous year, tensions rose. The Battle of Marathon
            in 490 BC. The following year, the Greeks celebrated.
            A decade earlier, Persia expanded."

Initial parse:
  [0] "The previous year"  → year=2027 (wrong, default)
  [1] "490 BC"             → year=-490
  [2] "The following year" → year=2027 (wrong, default)
  [3] "A decade earlier"   → year=2016 (wrong, default)

Iteration 1, forward pass:
  [0] no anchor → skip (hadForwardAnchor=false)
  [1] no anchor → skip, but sets anchor=-490
  [2] anchor=-490 → re-parse → year=-489 ✓ (hadForwardAnchor=true)
  [3] anchor=-489 → re-parse → year=-499 ✓ (hadForwardAnchor=true)

Iteration 1, backward pass (gaps only):
  [3] hadForwardAnchor=true → skip
  [2] hadForwardAnchor=true → skip
  [1] sets anchor=-490
  [0] hadForwardAnchor=false, anchor=-490 → re-parse → year=-491 ✓

Iteration 2: forward+backward → no changes → STOP (fixed point)

Final: [-491, -490, -489, -499] ✓
```

### Key Details

1. **Anchor year start**: The reference date is set to January 1 of the anchor's year, not the anchor date itself. This avoids month ambiguity (e.g., ref=July 1940 would make "June" resolve to June 1941 with `forwardDate`).

2. **`forwardDate: true`**: Only used for AD dates. Tells chrono to prefer dates after the reference (Jan 1940 → June = June 1940, not June 1939).

3. **BC-aware toggle**: For BC anchors (`refYear < 0`), `forwardDate` is disabled because chrono's forward-date refiner pushes dates toward the present, which is the wrong direction for BC chronology.

4. **Negative year handling**: For years < 0, `new Date(year, 0, 1)` doesn't work directly (years 0-99 get +1900). Instead: `const d = new Date(0, 0, 1); d.setFullYear(year)`.

5. **Convergence**: Self-contained parsers ignore `refDate`, so re-parsing never changes their results. Only ref-dependent results can change, and they stabilize once anchors propagate. This guarantees termination.

## Accuracy

Tested against the WikiWars curated dataset (200 fixtures from Wikipedia war articles):

| Category | Accuracy | Description |
|----------|----------|-------------|
| Self-contained | 91/91 (100%) | Text contains explicit year/era |
| Context-dependent | 49/54 (90.7%) | Year inferred from context |
| **Overall** | **140/145 (96.6%)** | All parseable date types |

### Known Limitations (5 cases)

These require capabilities beyond rule-based parsing:

| Expression | Why Unsolvable |
|-----------|----------------|
| "the same time as the battle in Poland" | Requires event-date knowledge base |
| "Shortly afterwards" | Vague temporal adverb, no arithmetic handle |
| "this point" | Deictic reference, not a temporal expression |
| "the good old days" | Metaphorical usage |
| "year" (from "the year's campaign") | Bare word, not a date reference |

Solving these would require either an LLM-based temporal reasoner or a knowledge base mapping historical events to dates.

## Performance

### Pipeline Benchmark

Full pipeline timing for varying document sizes (parse stages only, excludes React rendering):

| Sentences | Doc Size | Remark AST | Tokenize | Chrono fixed-point | Build Units | **Total** |
|-----------|----------|------------|----------|--------------------|-------------|-----------|
| 10 | 0.6KB | 1.3ms | 0.1ms | 0.6ms | 0.05ms | **2.6ms** |
| 100 | 6.2KB | 1.9ms | 0.2ms | 3.6ms | 0.1ms | **5.8ms** |
| 1,000 | 62KB | 13.8ms | 0.9ms | 28.8ms | 1.4ms | **45ms** |
| 3,000 | 187KB | 43.5ms | 2.6ms | 77.9ms | 4.8ms | **129ms** |

A typical Obsidian note (50-200 sentences) parses in under 6ms. Even a 1,000-sentence document completes in 45ms — well within a single animation frame.

### Fixed-Point Convergence Benchmark

Measured in Obsidian (Electron/Chromium):

| Paragraph | Sentences | Iterations | Time |
|-----------|-----------|------------|------|
| BC with backward ref | 5 | 2 | 1.4ms |
| WW2 forward only | 5 | 2 | 1.5ms |
| Mixed stress test | 100 | 2 | 16.3ms |

**Always converges in 2 iterations** — iteration 1 does forward+backward, iteration 2 confirms stability (no changes = fixed point). The MAX_ITERATIONS=5 safety cap is never reached in practice. The cost of the extra confirmation iteration is negligible (~0.15ms per sentence).

### Complexity Analysis

All pipeline stages scale linearly with document size:

- **Remark AST parsing**: O(T) where T = text length. Single pass through markdown.
- **Sentence tokenization** (`Intl.Segmenter`): O(T). ICU-based, constant work per character.
- **Chrono parsing**: O(S * P) where S = sentences, P = parser count (38). Each parser runs one regex per sentence. All regexes use `\b` word boundaries and have no nested quantifiers — no catastrophic backtracking risk.
- **Fixed-point overhead**: Each iteration re-parses all sentences (forward) plus gap sentences (backward). Converges in 2 iterations, so effective overhead is ~2x chrono calls. Self-contained results are stable across iterations, so the work is proportional to ref-dependent sentences only.

### Parser Count

| Category | Count |
|----------|-------|
| chrono-node built-in | 16 parsers, 14 refiners |
| Custom (standard formats) | 10 parsers |
| Custom (BC/BCE) | 4 parsers |
| Custom (relative expressions) | 3 parsers |
| Custom (BC-context propagation) | 5 parsers |
| Custom (refiners) | 1 refiner |
| **Total** | **38 parsers, 15 refiners** |

Adding 22 custom parsers increased per-sentence parse time by ~30% (0.023ms → 0.030ms). This is negligible — the parser overhead is dwarfed by other operations.

### Previous Bottleneck: natural.js

Before the migration to `Intl.Segmenter`, the sentence tokenization stage was the dominant bottleneck due to `natural.SentenceTokenizer`'s O(n^2) scaling. At 1,000 sentences it consumed 2,621ms — 98% of the total pipeline time. Replacing it with `Intl.Segmenter` (0.9ms for the same input) reduced total pipeline time from 2,665ms to 45ms, a **59x speedup**.

## References

- [SUTime: A Library for Recognizing and Normalizing Time Expressions](https://nlp.stanford.edu/pubs/lrec2012-sutime.pdf) (Stanford NLP)
- [HeidelTime: High Quality Rule-Based Extraction and Normalization of Temporal Expressions](https://github.com/HeidelTime/heideltime) (Heidelberg University)
- [TIMEX3 / TimeML Annotation Standard](https://www.timeml.org/)
- [chrono-node: Natural Language Date Parser](https://github.com/wanasit/chrono) (v2.x)
- [Discourse-Aware In-Context Learning for Temporal Expression Normalization](https://arxiv.org/html/2404.07775v1) (2024)
