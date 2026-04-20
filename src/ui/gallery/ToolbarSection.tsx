import {Section, Row, Tile} from "./helpers";
import {Spinner} from "../Spinner";
import {TimelineToolbarUI, toolbarBtn, toolbarIconBtn} from "../TimelineToolbarUI";
import {NativeDropdownMenu} from "../NativeDropdownMenu";
import {FilePicker} from "../FilePicker";
import {SmallCheck, SmallExport} from "../icons";

export function ToolbarSection() {
	return (
		<Section id="toolbar" title="Toolbar / Menubar">
			<Row gap={16} style={{alignItems: "flex-start"}}>

				<Tile label="toolbar · expanded">
					<div style={{width: 380}}>
						<TimelineToolbarUI
							entryCountText="12 entries"
							saveStatus="Saved"
							stats={{dates: 12, sentences: 47, coverage: "25%"}}
							hiddenCount={3}
							sigFilter={2}
							parseSlot={
								<NativeDropdownMenu
									trigger={
										<span style={{display: "inline-flex", alignItems: "center", gap: 4}}>
											<SmallCheck/>
											Parse
										</span>
									}
									triggerStyle={toolbarBtn}
									items={[
										{type: "item", label: "Parse this file", onClick: () => {}},
										{type: "item", label: "Parse from file…", submenuContent: (
											<FilePicker
												files={[{path: "notes/Columbus.md"}, {path: "notes/Magellan.md"}, {path: "notes/Drake.md"}]}
												placeholder="search file path"
												emptyText="No file selected"
												onSelect={() => {}}
											/>
										)},
									]}
								/>
							}
							sortSlot={
								<NativeDropdownMenu
									trigger="↑↓ Sort"
									triggerStyle={toolbarBtn}
									items={[
										{type: "item", label: "Ascending", onClick: () => {}},
										{type: "item", label: "Descending", onClick: () => {}},
									]}
								/>
							}
							exportSlot={
								<NativeDropdownMenu
									trigger={<SmallExport/>}
									triggerStyle={toolbarIconBtn}
									items={[
										{type: "item", label: "PNG (save file)", onClick: () => {}},
										{type: "item", label: "PNG (clipboard)", onClick: () => {}},
										{type: "item", label: "Plain text (clipboard)", onClick: () => {}},
										{type: "item", label: "JSON (clipboard)", onClick: () => {}},
										{type: "item", label: "Markdown (clipboard)", onClick: () => {}},
										{type: "item", label: "HTML (save file)", onClick: () => {}},
									]}
								/>
							}
						/>
					</div>
				</Tile>

				<Tile label="toolbar · collapsed">
					<div style={{width: 280}}>
						<TimelineToolbarUI
							entryCountText="12 entries"
							saveStatus="Saved"
							defaultCollapsed
						/>
					</div>
				</Tile>

				<Tile label="save status · variants">
					<div style={{display: "flex", flexDirection: "column", gap: 8}}>
						{[
							{label: "Saved",         color: "var(--text-muted)",   opacity: 0.5},
							{label: "Unsaved",        color: "var(--text-accent)",  opacity: 1},
							{label: "Saving…",        color: "var(--text-muted)",   opacity: 0.7},
							{label: "Not saved yet",  color: "var(--text-faint)",   opacity: 0.5},
						].map(({label, color, opacity}) => (
							<div key={label} style={{display: "flex", alignItems: "center", gap: 6}}>
								<span style={{fontSize: 10, color, opacity, fontFamily: "monospace", minWidth: 90}}>{label}</span>
								{label === "Saving…" && <Spinner size={10}/>}
							</div>
						))}
					</div>
				</Tile>

			</Row>
		</Section>
	);
}
