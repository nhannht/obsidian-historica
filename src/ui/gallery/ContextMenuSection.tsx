import {Section, Row, Tile} from "./helpers";
import {MenuPanel} from "../MenuPanel";
import type {MenuNode} from "../menuTypes";

const MOCK_ITEMS: MenuNode[] = [
	{type: "item", label: "Jump to source"},
	{type: "item", label: "Add attachment"},
	{type: "separator"},
	{type: "item", label: "Hide from view"},
	{type: "item", label: "Dismiss extraction", muted: true},
];

export function ContextMenuSection() {
	return (
		<Section id="context-menu" title="Context Menu">
			<Row gap={24}>
				<Tile label="MenuPanel · shared component">
					<div style={{position: "relative", minWidth: 200}}>
						<MenuPanel items={MOCK_ITEMS} onClose={() => {}}/>
					</div>
				</Tile>
			</Row>
		</Section>
	);
}
