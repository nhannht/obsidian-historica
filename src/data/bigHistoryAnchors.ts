/**
 * Curated Big History anchor events.
 *
 * These populate the timeline before a user adds their own notes, giving
 * personal events something to land against at cosmic zoom levels.
 *
 * Year convention (time.value):
 *   - Positive integer string  → AD year  (e.g. "1969")
 *   - Negative integer string  → BC year  (e.g. "-44" = 44 BC)
 *   - Large negative           → years BP (e.g. "-66000000" = 66 Ma ago)
 *   time.style is always "free" for anchors; the D3 engine reads value directly.
 *
 * Significance scale:
 *   5 — civilisation-altering, always visible even at cosmic zoom
 *   4 — major turning point, visible at era zoom
 *   3 — important event, visible at century zoom
 *   2 — notable, visible at decade zoom
 *   1 — detail, visible only at close zoom
 */

import type { TimelineEntry } from "@/src/types"

export type Era = {
	id: string
	label: string
	/** AD year (negative = BC/prehistoric) of era start */
	startYear: number
	/** AD year of era end (undefined = present) */
	endYear?: number
	significance: 5 | 4 | 3
}

export const BIG_HISTORY_ERAS: Era[] = [
	{ id: "cosmic",    label: "Cosmic Era",       startYear: -13_800_000_000, endYear: -4_500_000_000, significance: 5 },
	{ id: "earth",     label: "Earth Era",         startYear:  -4_500_000_000, endYear:   -541_000_000, significance: 5 },
	{ id: "life",      label: "Life Era",          startYear:    -541_000_000, endYear:     -2_500_000, significance: 5 },
	{ id: "humanity",  label: "Early Humanity",    startYear:      -2_500_000, endYear:         -3_000, significance: 5 },
	{ id: "ancient",   label: "Ancient History",   startYear:          -3_000, endYear:            500, significance: 4 },
	{ id: "medieval",  label: "Medieval Period",   startYear:             500, endYear:           1500, significance: 4 },
	{ id: "modern",    label: "Modern Era",        startYear:            1500,                          significance: 4 },
]

function anchor(
	id: string,
	sentence: string,
	year: number,
	eraId: string,
	significance: 1 | 2 | 3 | 4 | 5,
): TimelineEntry {
	return {
		id: `anchor:${id}`,
		filePath: "",
		parsedResultText: String(year),
		sentence,
		time: { style: "free", value: String(year) },
		attachments: [],
		isExpanded: false,
		isHidden: false,
		isAnchor: true,
		eraId,
		significance,
	}
}

export const BIG_HISTORY_ANCHORS: TimelineEntry[] = [
	// ── Cosmic Era ────────────────────────────────────────────────────────────
	anchor("big-bang",       "Big Bang — origin of space, time, and matter",          -13_800_000_000, "cosmic",   5),
	anchor("first-stars",    "First stars ignite — universe exits the Dark Ages",     -13_200_000_000, "cosmic",   4),
	anchor("milky-way",      "Milky Way galaxy forms",                                -13_600_000_000, "cosmic",   4),
	anchor("solar-system",   "Solar system forms from collapsing nebula",              -4_600_000_000, "cosmic",   5),

	// ── Earth Era ─────────────────────────────────────────────────────────────
	anchor("earth-forms",    "Earth forms and cools",                                  -4_500_000_000, "earth",    5),
	anchor("moon-forms",     "Giant impact forms the Moon",                            -4_500_000_000, "earth",    4),
	anchor("first-life",     "First life — prokaryotic cells appear",                  -3_800_000_000, "earth",    5),
	anchor("oxidation",      "Great Oxidation Event — oxygen enters atmosphere",       -2_400_000_000, "earth",    5),
	anchor("eukaryotes",     "First eukaryotic (complex) cells evolve",                -2_000_000_000, "earth",    4),
	anchor("multicellular",  "First multicellular organisms",                          -1_200_000_000, "earth",    4),

	// ── Life Era ──────────────────────────────────────────────────────────────
	anchor("cambrian",       "Cambrian Explosion — most animal phyla appear",            -541_000_000, "life",     5),
	anchor("first-fish",     "First vertebrates (jawless fish) appear",                  -530_000_000, "life",     4),
	anchor("land-plants",    "Plants colonise land",                                     -470_000_000, "life",     4),
	anchor("first-insects",  "First insects appear",                                     -400_000_000, "life",     3),
	anchor("first-reptiles", "First reptiles — vertebrates fully conquer land",          -320_000_000, "life",     4),
	anchor("first-dinos",    "First dinosaurs evolve",                                   -230_000_000, "life",     4),
	anchor("first-mammals",  "First mammals appear alongside dinosaurs",                 -225_000_000, "life",     4),
	anchor("first-flowers",  "Flowering plants (angiosperms) emerge",                    -130_000_000, "life",     3),
	anchor("kt-extinction",  "K-Pg mass extinction — non-avian dinosaurs wiped out",      -66_000_000, "life",     5),
	anchor("first-primates", "First primates appear after dinosaur extinction",           -55_000_000, "life",     4),
	anchor("great-apes",     "Hominid lineage diverges from other great apes",             -7_000_000, "life",     5),

	// ── Early Humanity ────────────────────────────────────────────────────────
	anchor("bipedalism",     "Australopithecus — first bipedal hominids",                 -4_000_000, "humanity", 5),
	anchor("homo-habilis",   "Homo habilis — first tool use",                             -2_500_000, "humanity", 5),
	anchor("homo-erectus",   "Homo erectus spreads out of Africa",                        -1_800_000, "humanity", 4),
	anchor("fire",           "Controlled use of fire",                                    -1_000_000, "humanity", 5),
	anchor("homo-sapiens",   "Homo sapiens evolves in Africa",                              -300_000, "humanity", 5),
	anchor("out-of-africa",  "Modern humans migrate Out of Africa",                          -70_000, "humanity", 5),
	anchor("cave-art",       "Earliest cave art — symbolic thinking",                        -40_000, "humanity", 4),
	anchor("agriculture",    "Agricultural Revolution — first farming societies",            -10_000, "humanity", 5),

	// ── Ancient History ───────────────────────────────────────────────────────
	anchor("writing",        "Invention of writing (cuneiform, Sumer)",                      -3_200, "ancient",  5),
	anchor("pyramids",       "Egyptian pyramids built — Old Kingdom",                        -2_560, "ancient",  4),
	anchor("bronze-age",     "Bronze Age civilisations flourish",                            -3_000, "ancient",  4),
	anchor("iron-age",       "Iron Age begins — iron displaces bronze",                      -1_200, "ancient",  4),
	anchor("greek-golden",   "Golden Age of Greece — philosophy, democracy",                   -500, "ancient",  5),
	anchor("alexander",      "Alexander the Great unifies Greek world to India",               -336, "ancient",  4),
	anchor("qin-dynasty",    "Qin Shi Huang unifies China — first Chinese empire",             -221, "ancient",  4),
	anchor("julius-caesar",  "Julius Caesar assassinated — end of Roman Republic",              -44, "ancient",  4),
	anchor("jesus",          "Birth of Jesus of Nazareth",                                       0, "ancient",  5),
	anchor("rome-falls",     "Fall of Western Roman Empire",                                   476, "ancient",  5),

	// ── Medieval Period ───────────────────────────────────────────────────────
	anchor("islam",          "Muhammad founds Islam — rapid expansion across MENA",           622, "medieval", 5),
	anchor("charlemagne",    "Charlemagne crowned — Holy Roman Empire",                       800, "medieval", 4),
	anchor("viking-age",     "Viking Age expansion across Europe and Atlantic",               793, "medieval", 3),
	anchor("magna-carta",    "Magna Carta — limits of royal power enshrined",                1215, "medieval", 4),
	anchor("black-death",    "Black Death kills one-third of Europe's population",           1347, "medieval", 5),
	anchor("printing-press", "Gutenberg printing press — information revolution",            1440, "medieval", 5),

	// ── Modern Era ────────────────────────────────────────────────────────────
	anchor("columbus",       "Columbus reaches the Americas",                                1492, "modern",   5),
	anchor("copernicus",     "Copernican Revolution — Earth orbits the Sun",                 1543, "modern",   5),
	anchor("reformation",    "Protestant Reformation — Christianity splits",                 1517, "modern",   4),
	anchor("galileo",        "Galileo confirms heliocentrism with telescope",                1610, "modern",   4),
	anchor("newton",         "Newton publishes Principia — laws of motion and gravity",      1687, "modern",   5),
	anchor("industrial-rev", "Industrial Revolution begins in Britain",                      1760, "modern",   5),
	anchor("us-independence","American Declaration of Independence",                         1776, "modern",   4),
	anchor("french-rev",     "French Revolution — Liberty, Equality, Fraternity",            1789, "modern",   4),
	anchor("darwin",         "Darwin publishes On the Origin of Species",                    1859, "modern",   5),
	anchor("ww1",            "World War I — industrial-scale warfare",                       1914, "modern",   5),
	anchor("russian-rev",    "Russian Revolution — first communist state",                   1917, "modern",   4),
	anchor("ww2",            "World War II — deadliest conflict in human history",            1939, "modern",   5),
	anchor("holocaust",      "Holocaust — systematic genocide of six million Jews",           1941, "modern",   5),
	anchor("atomic-bomb",    "Atomic bombs dropped on Hiroshima and Nagasaki",               1945, "modern",   5),
	anchor("united-nations", "United Nations founded",                                       1945, "modern",   4),
	anchor("cold-war",       "Cold War begins — nuclear standoff between superpowers",       1947, "modern",   4),
	anchor("dna-structure",  "Watson and Crick describe DNA double helix",                   1953, "modern",   5),
	anchor("moon-landing",   "Apollo 11 — humans land on the Moon",                         1969, "modern",   5),
	anchor("internet",       "World Wide Web opens to the public",                           1991, "modern",   5),
	anchor("human-genome",   "Human Genome Project completed",                              2003, "modern",   4),
	anchor("smartphone",     "iPhone launches — smartphone era begins",                     2007, "modern",   4),
	anchor("covid",          "COVID-19 global pandemic",                                    2020, "modern",   4),
]
