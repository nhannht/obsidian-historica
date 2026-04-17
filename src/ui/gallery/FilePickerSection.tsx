import {Section, Row, Tile} from "./helpers";

export function FilePickerSection() {
	const files = [
		{path: "notes/Battle of Hastings.md", selected: true},
		{path: "images/1066-map.png",         selected: false},
		{path: "Obsidian Overview.md",         selected: false},
	];
	return (
		<Section id="file-picker" title="FilePicker">
			<Row gap={24}>
				<Tile label="inline dropdown · monospace filter">
					<div style={{width: 300}}>
						<input readOnly value="Obsidian" style={{
							width: "100%", padding: "6px 10px", fontSize: 12,
							fontFamily: "monospace",
							background: "var(--background-primary)",
							color: "var(--text-normal)",
							border: "1px solid var(--interactive-accent)",
							borderBottom: "none",
							borderRadius: "3px 3px 0 0",
							outline: "none", boxSizing: "border-box",
						}} placeholder="filter…"/>
						<div style={{
							border: "1px solid var(--background-modifier-border)",
							borderTop: "none", borderRadius: "0 0 3px 3px", overflow: "hidden",
						}}>
							{files.map(({path, selected}) => (
								<div key={path} style={{
									display: "flex", alignItems: "center", gap: 8,
									padding: "5px 10px", fontSize: 12, fontFamily: "monospace",
									color: selected ? "var(--text-accent)" : "var(--text-muted)",
									background: selected ? "color-mix(in srgb, var(--interactive-accent) 6%, transparent)" : "var(--background-primary)",
									borderBottom: "1px solid color-mix(in srgb, var(--background-modifier-border) 40%, transparent)",
								}}>
									<span style={{minWidth: 10, fontSize: 10, opacity: selected ? 1 : 0}}>●</span>
									<span>{path}</span>
								</div>
							))}
						</div>
					</div>
				</Tile>

				<Tile label="command palette · large">
					<div style={{
						border: "1px solid var(--background-modifier-border)",
						borderRadius: 6, overflow: "hidden", width: 300,
					}}>
						<input readOnly value="Obsidian" style={{
							width: "100%", padding: "10px 14px", fontSize: 14,
							background: "var(--background-primary)", color: "var(--text-normal)",
							border: "none", borderBottom: "1px solid var(--background-modifier-border)",
							outline: "none", boxSizing: "border-box",
						}} placeholder="Search attachments…"/>
						{files.map(({path, selected}) => (
							<div key={path} style={{
								display: "flex", alignItems: "center", gap: 10,
								padding: "8px 14px", fontSize: 13,
								color: "var(--text-normal)",
								background: selected ? "color-mix(in srgb, var(--interactive-accent) 8%, transparent)" : "transparent",
							}}>
								<span style={{fontSize: 12, color: "var(--text-accent)", opacity: selected ? 1 : 0, minWidth: 14}}>✓</span>
								<span>{path}</span>
							</div>
						))}
					</div>
				</Tile>
			</Row>
		</Section>
	);
}
