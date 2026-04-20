import {Section, Row, Tile} from "./helpers";
import {FilePicker} from "../FilePicker";

const MOCK_FILES = [
	{path: "notes/Battle of Hastings.md"},
	{path: "images/1066-map.png"},
	{path: "notes/Magna Carta.md"},
	{path: "notes/Columbus Voyage.md"},
	{path: "Obsidian Overview.md"},
];

export function FilePickerSection() {
	return (
		<Section id="file-picker" title="FilePicker">
			<Row gap={24}>
				<Tile label="FilePicker · shared component">
					<div style={{width: 300}}>
						<FilePicker
							files={MOCK_FILES}
							placeholder="Search attachments…"
							emptyText="No files found"
							onSelect={() => {}}
						/>
					</div>
				</Tile>
			</Row>
		</Section>
	);
}
