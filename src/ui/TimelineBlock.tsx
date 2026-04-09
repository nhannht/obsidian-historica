import {useRef, useState, useEffect} from "react";
import {useStore} from "zustand";
import type {StoreApi} from "zustand";
import HistoricaPlugin from "@/main";
import type {TimelineStore} from "@/src/store/createTimelineStore";
import {toPng} from "html-to-image";
import {TimelineI} from "@/src/ui/TimelineI";
import {ExportAsJSONToClipboard, ExportAsMarkdownToClipboard, GetAllMarkdownFileInVault, GetAllHistoricaDataFile} from "@/src/utils";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/src/ui/shadcn/Command";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger
} from "@/src/ui/shadcn/ContextMenu";
import HeaderAndFooterEditor from "@/src/ui/HeaderAndFooterEditor";
import {Notice} from "obsidian";

export function TimelineBlock(props: {
	store: StoreApi<TimelineStore>;
	plugin: HistoricaPlugin;
}) {
	const {store, plugin} = props;

	const units = useStore(store, s => s.units);
	const settings = useStore(store, s => s.settings);
	const isLoading = useStore(store, s => s.isLoading);
	const error = useStore(store, s => s.error);

	const manualSave = useStore(store, s => s.manualSave);
	const addUnit = useStore(store, s => s.addUnit);
	const removeUnit = useStore(store, s => s.removeUnit);
	const editUnit = useStore(store, s => s.editUnit);
	const moveUnit = useStore(store, s => s.moveUnit);
	const sort = useStore(store, s => s.sort);
	const expandUnit = useStore(store, s => s.expandUnit);
	const expandAll = useStore(store, s => s.expandAll);
	const removeAll = useStore(store, s => s.removeAll);
	const editHeaderOrFooter = useStore(store, s => s.editHeaderOrFooter);
	const parseFromFile = useStore(store, s => s.parseFromFile);
	const importFromTimeline = useStore(store, s => s.importFromTimeline);

	const timelineRef = useRef<HTMLDivElement | null>(null);
	const [isShowHeaderEditor, setIsShowHeaderEditor] = useState(false);
	const [isShowFooterEditor, setIsShowFooterEditor] = useState(false);

	useEffect(() => {
		store.getState().load();
		return () => {
			if ((store as any).destroy) (store as any).destroy();
		};
	}, []);

	if (isLoading) {
		return <div className="twp p-4">Loading timeline...</div>;
	}

	if (error) {
		return <div className="twp p-4 text-red-500">Error: {error}</div>;
	}

	const handleConvertToPngAndSave = async () => {
		if (timelineRef.current) {
			const imageData = await toPng(timelineRef.current);
			const link = document.createElement("a");
			link.href = imageData;
			link.download = "historica-timeline.png";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			new Notice("Image saved", 10000);
		}
	};

	const handleConvertToPngAndCopy = async () => {
		if (timelineRef.current) {
			const imageData = await toPng(timelineRef.current);
			const response = await fetch(imageData);
			const blob = await response.blob();
			try {
				await navigator.clipboard.write([
					new ClipboardItem({[blob.type]: blob})
				]);
				new Notice("Image copied to clipboard", 10000);
			} catch (err) {
				console.error("Failed to copy image to clipboard:", err);
			}
		}
	};

	const timelineContent = () => {
		if (units.length > 0) {
			return (
				<div className="p-4">
					{isShowHeaderEditor && (
						<HeaderAndFooterEditor
							setIsShow={setIsShowHeaderEditor}
							plugin={plugin}
							handleEdit={editHeaderOrFooter}
							content={settings.header}
							type="header"
						/>
					)}
					<TimelineI
						settings={settings}
						units={units}
						timelineRef={timelineRef}
						plugin={plugin}
						handleRemovePlotUnit={removeUnit}
						handleEditPlotUnit={editUnit}
						handleAddPlotUnit={addUnit}
						handleMove={moveUnit}
						handleExpandSingle={expandUnit}
						isDisplayFooter={!isShowFooterEditor}
						isDisplayHeader={!isShowHeaderEditor}
					/>
					{isShowFooterEditor && (
						<HeaderAndFooterEditor
							setIsShow={setIsShowFooterEditor}
							plugin={plugin}
							handleEdit={editHeaderOrFooter}
							content={settings.footer}
							type="footer"
						/>
					)}
				</div>
			);
		}
		return (
			<div className="p-4 text-center">
				<p>This timeline is empty. Right-click to add a plot unit or parse from a file.</p>
			</div>
		);
	};

	return (
		<div className="twp">
			<ContextMenu>
				<ContextMenuTrigger>
					<div className="min-h-full p-4">
						{timelineContent()}
					</div>
				</ContextMenuTrigger>

				<ContextMenuContent>
					<ContextMenuItem onClick={() => manualSave()}>Save</ContextMenuItem>
					<ContextMenuSub>
						<ContextMenuSubTrigger>Edit decorations</ContextMenuSubTrigger>
						<ContextMenuSubContent>
							<ContextMenuItem onClick={() => setIsShowHeaderEditor(true)}>Header</ContextMenuItem>
							<ContextMenuItem onClick={() => setIsShowFooterEditor(true)}>Footer</ContextMenuItem>
						</ContextMenuSubContent>
					</ContextMenuSub>
					<ContextMenuSub>
						<ContextMenuSubTrigger>Sort</ContextMenuSubTrigger>
						<ContextMenuSubContent>
							<ContextMenuItem onClick={() => sort("asc")}>Ascending</ContextMenuItem>
							<ContextMenuItem onClick={() => sort("desc")}>Descending</ContextMenuItem>
						</ContextMenuSubContent>
					</ContextMenuSub>
					<ContextMenuItem onClick={() => expandAll(true)}>Expand All</ContextMenuItem>
					<ContextMenuItem onClick={() => expandAll(false)}>Fold All</ContextMenuItem>
					<ContextMenuItem onClick={removeAll}>Remove All</ContextMenuItem>
					<ContextMenuSub>
						<ContextMenuSubTrigger>Parse timeline from file</ContextMenuSubTrigger>
						<ContextMenuSubContent>
							<Command>
								<CommandInput placeholder="search file path"/>
								<CommandList>
									<CommandEmpty>No file selected</CommandEmpty>
									<CommandGroup>
										{GetAllMarkdownFileInVault(plugin).map(f => (
											<CommandItem
												key={f.path}
												value={f.path}
												onSelect={async (value) => parseFromFile(value)}
											>
												{f.path}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</ContextMenuSubContent>
					</ContextMenuSub>
					<ContextMenuSub>
						<ContextMenuSubTrigger>Export</ContextMenuSubTrigger>
						<ContextMenuSubContent>
							<ContextMenuSub>
								<ContextMenuSubTrigger>Image (PNG)</ContextMenuSubTrigger>
								<ContextMenuSubContent>
									<ContextMenuItem onClick={handleConvertToPngAndSave}>Save as file</ContextMenuItem>
									<ContextMenuItem onClick={handleConvertToPngAndCopy}>Copy to clipboard</ContextMenuItem>
								</ContextMenuSubContent>
							</ContextMenuSub>
							<ContextMenuItem onClick={() => ExportAsJSONToClipboard({units, settings})}>
								JSON to clipboard
							</ContextMenuItem>
							<ContextMenuItem onClick={() => ExportAsMarkdownToClipboard({units, settings}, plugin)}>
								Markdown to clipboard
							</ContextMenuItem>
						</ContextMenuSubContent>
					</ContextMenuSub>
					<ContextMenuSub>
						<ContextMenuSubTrigger>Import from timeline</ContextMenuSubTrigger>
						<ContextMenuSubContent>
							<Command>
								<CommandInput placeholder="pick file to import"/>
								<CommandList>
									<CommandEmpty>No file selected</CommandEmpty>
									<CommandGroup>
										{GetAllHistoricaDataFile(plugin).map(f => (
											<CommandItem
												key={f.path}
												value={f.path}
												onSelect={async (value) => importFromTimeline(value)}
											>
												{f.path}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</ContextMenuSubContent>
					</ContextMenuSub>
					<ContextMenuItem onClick={() => addUnit(0)}>Add at beginning</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
		</div>
	);
}
