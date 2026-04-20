import { useState } from "react"
import { Section, Row, Tile } from "./helpers"
import { TimelineMinimap } from "@/src/ui/TimelineMinimap"
import { StatPill } from "@/src/ui/StatPill"
import type { TimelineEntry } from "@/src/types"

function mockEntry(id: string, sig?: 1 | 2 | 3 | 4 | 5): TimelineEntry {
	return {
		id,
		filePath: "mock.md",
		parsedResultText: id,
		sentence: id,
		time: { style: "unix", value: "0" },
		attachments: [],
		isExpanded: false,
		significance: sig,
	}
}

const MOCK_ENTRIES: Array<{ entry: TimelineEntry; y: number }> = [
	{ entry: mockEntry("e1", 3),  y: 20  },
	{ entry: mockEntry("e2", 2),  y: 60  },
	{ entry: mockEntry("e3", 5),  y: 100 },
	{ entry: mockEntry("e4", 1),  y: 150 },
	{ entry: mockEntry("e5", 2),  y: 200 },
	{ entry: mockEntry("e6", 4),  y: 240 },
	{ entry: mockEntry("e7", 3),  y: 300 },
	{ entry: mockEntry("e8", 2),  y: 340 },
	{ entry: mockEntry("e9", 3),  y: 390 },
	{ entry: mockEntry("e10", 1), y: 440 },
	{ entry: mockEntry("e11", 4), y: 490 },
	{ entry: mockEntry("e12", 2), y: 550 },
]

function MinimapDemo({
	yearMin,
	yearMax,
	initialRange,
}: {
	yearMin: number
	yearMax: number
	initialRange: [number, number]
}) {
	const [range, setRange] = useState<[number, number]>(initialRange)
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
			<div style={{ flex: 1, minWidth: 0 }}>
				<TimelineMinimap
					yearMin={yearMin}
					yearMax={yearMax}
					yearRange={range}
					onYearRangeChange={setRange}
					positionedEntries={MOCK_ENTRIES}
				/>
			</div>
			<StatPill value={`sig ≥ 1 · ${MOCK_ENTRIES.length} events`} />
		</div>
	)
}

export function MinimapSection() {
	return (
		<Section id="minimap" title="Timeline Minimap">
			<Row gap={16}>
				<Tile label="full range selected (default)">
					<MinimapDemo yearMin={1938} yearMax={1946} initialRange={[1938, 1946]} />
				</Tile>
				<Tile label="partial range — handles visible">
					<MinimapDemo yearMin={1938} yearMax={1946} initialRange={[1939, 1944]} />
				</Tile>
				<Tile label="narrow zoom — right side">
					<MinimapDemo yearMin={1938} yearMax={1946} initialRange={[1943, 1946]} />
				</Tile>
			</Row>
		</Section>
	)
}
