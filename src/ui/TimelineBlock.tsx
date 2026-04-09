import {useRef, useState, useEffect, useMemo} from "react";
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
	const showHidden = useStore(store, s => s.showHidden);
	const isDirty = useStore(store, s => s.isDirty);
	const isSaving = useStore(store, s => s.isSaving);

	const manualSave = useStore(store, s => s.manualSave);
	const addUnit = useStore(store, s => s.addUnit);
	const removeUnit = useStore(store, s => s.removeUnit);
	const editUnit = useStore(store, s => s.editUnit);
	const moveUnit = useStore(store, s => s.moveUnit);
	const sort = useStore(store, s => s.sort);
	const expandUnit = useStore(store, s => s.expandUnit);
	const expandAll = useStore(store, s => s.expandAll);
	const hideUnit = useStore(store, s => s.hideUnit);
	const toggleShowHidden = useStore(store, s => s.toggleShowHidden);
	const removeAll = useStore(store, s => s.removeAll);
	const editHeaderOrFooter = useStore(store, s => s.editHeaderOrFooter);
	const parseFromFile = useStore(store, s => s.parseFromFile);
	const importFromTimeline = useStore(store, s => s.importFromTimeline);

	const timelineRef = useRef<HTMLDivElement | null>(null);
	const [isShowHeaderEditor, setIsShowHeaderEditor] = useState(false);
	const [isShowFooterEditor, setIsShowFooterEditor] = useState(false);
	const [isShowFilePicker, setIsShowFilePicker] = useState(false);
	const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);

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

	const hiddenCount = units.filter(u => u.isHidden).length;
	const visibleCount = units.length - hiddenCount;
	const allExpanded = units.length > 0 && units.every(u => u.isExpanded);
	const markdownFiles = useMemo(() => GetAllMarkdownFileInVault(plugin), [plugin]);

	const saveStatus = isSaving
		? "Saving..."
		: isDirty
			? "Unsaved"
			: settings.blockId === "-1"
				? "Not saved yet"
				: "Saved";

	const saveStatusColor = isSaving
		? "text-[color:--text-muted]"
		: isDirty
			? "text-[color:--text-accent]"
			: "text-[color:--text-muted] opacity-60";

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

	const handleToggleExpand = () => {
		expandAll(!allExpanded);
	};

	const toolbarBtnClass = "px-2 py-0.5 rounded text-[color:--text-muted] hover:text-[color:--text-normal] hover:bg-[--background-modifier-hover] cursor-pointer";

	const toolbar = () => (
		<div className="border-b border-[--background-modifier-border] px-3 py-1.5 text-xs">
			{/* Status bar */}
			<div className="flex items-center justify-between mb-1">
				<div className="flex items-center gap-2">
					<span
						className="font-semibold text-[color:--text-normal] cursor-pointer hover:text-[color:--text-accent]"
						onClick={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
						title={isToolbarCollapsed ? "Show toolbar" : "Hide toolbar"}
					>Historica</span>
					<span className="text-[color:--text-muted]">{visibleCount} entries{hiddenCount > 0 ? ` (${hiddenCount} hidden)` : ""}</span>
				</div>
				<span className={saveStatusColor}>{saveStatus}</span>
			</div>
			{/* Action bar */}
			{!isToolbarCollapsed && (
				<div className="flex items-center gap-1 flex-wrap">
					<button className={toolbarBtnClass} onClick={handleToggleExpand}
					>{allExpanded ? "Fold all" : "Expand all"}</button>

					<ContextMenu>
						<ContextMenuTrigger>
							<button className={toolbarBtnClass}>Sort</button>
						</ContextMenuTrigger>
						<ContextMenuContent>
							<ContextMenuItem onClick={() => sort("asc")}>Ascending</ContextMenuItem>
							<ContextMenuItem onClick={() => sort("desc")}>Descending</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>

					<ContextMenu>
						<ContextMenuTrigger>
							<button className={toolbarBtnClass}>Parse</button>
						</ContextMenuTrigger>
						<ContextMenuContent>
							{plugin.app.workspace.getActiveFile() && (
								<ContextMenuItem onClick={() => {
									const f = plugin.app.workspace.getActiveFile();
									if (f) parseFromFile(f.path);
								}}>Parse this file</ContextMenuItem>
							)}
							<ContextMenuSub>
								<ContextMenuSubTrigger>Parse from file...</ContextMenuSubTrigger>
								<ContextMenuSubContent>
									<Command>
										<CommandInput placeholder="search file path"/>
										<CommandList>
											<CommandEmpty>No file selected</CommandEmpty>
											<CommandGroup>
												{markdownFiles.map(f => (
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
						</ContextMenuContent>
					</ContextMenu>

					<ContextMenu>
						<ContextMenuTrigger>
							<button className={toolbarBtnClass}>Export</button>
						</ContextMenuTrigger>
						<ContextMenuContent>
							<ContextMenuItem onClick={handleConvertToPngAndSave}>PNG (save file)</ContextMenuItem>
							<ContextMenuItem onClick={handleConvertToPngAndCopy}>PNG (clipboard)</ContextMenuItem>
							<ContextMenuItem onClick={() => ExportAsJSONToClipboard({units, settings})}>JSON (clipboard)</ContextMenuItem>
							<ContextMenuItem onClick={() => ExportAsMarkdownToClipboard({units, settings}, plugin)}>Markdown (clipboard)</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>

					<button
						className={`px-2 py-0.5 rounded cursor-pointer ${isDirty ? "text-[color:--text-accent] hover:bg-[--background-modifier-hover]" : "text-[color:--text-muted] hover:text-[color:--text-normal] hover:bg-[--background-modifier-hover]"}`}
						onClick={() => manualSave()}
					>Save</button>

					{hiddenCount > 0 && (
						<button className={toolbarBtnClass} onClick={toggleShowHidden}
						>{showHidden ? "Hide hidden" : `Show hidden (${hiddenCount})`}</button>
					)}
				</div>
			)}
		</div>
	);

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
						handleHideUnit={hideUnit}
						showHidden={showHidden}
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
		const currentFile = plugin.app.workspace.getActiveFile();
		return (
			<div className="p-6 flex flex-col items-center gap-3">
				<p className="text-sm text-[color:--text-muted] mb-2">No timeline entries yet</p>
				{currentFile && (
					<button
						className="w-64 px-4 py-2 rounded text-sm font-medium bg-[--interactive-accent] text-[--text-on-accent] hover:opacity-90 cursor-pointer"
						onClick={() => parseFromFile(currentFile.path)}
					>
						Parse this file
					</button>
				)}
				{!isShowFilePicker ? (
					<button
						className="w-64 px-4 py-2 rounded text-sm font-medium border border-[--background-modifier-border] bg-[--background-primary] text-[color:--text-normal] hover:bg-[--background-modifier-hover] cursor-pointer"
						onClick={() => setIsShowFilePicker(true)}
					>
						Parse from another file...
					</button>
				) : (
					<div className="w-80">
						<Command>
							<CommandInput placeholder="Search files..." autoFocus />
							<CommandList>
								<CommandEmpty>No files found</CommandEmpty>
								<CommandGroup>
									{markdownFiles.map(f => (
										<CommandItem
											key={f.path}
											value={f.path}
											onSelect={async (value) => {
												setIsShowFilePicker(false);
												await parseFromFile(value);
											}}
										>
											{f.path}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</div>
				)}
				<button
					className="w-64 px-4 py-2 rounded text-sm font-medium border border-[--background-modifier-border] bg-[--background-primary] text-[color:--text-normal] hover:bg-[--background-modifier-hover] cursor-pointer"
					onClick={() => addUnit(0)}
				>
					Add entry manually
				</button>
			</div>
		);
	};

	return (
		<div className="twp">
			{toolbar()}
			<ContextMenu>
				<ContextMenuTrigger>
					<div className="min-h-full p-4 overflow-y-auto resize-y" style={{maxHeight: "70vh"}}>
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
					<ContextMenuItem onClick={toggleShowHidden}>
						{showHidden ? "Hide hidden entries" : `Show hidden entries${hiddenCount > 0 ? ` (${hiddenCount})` : ""}`}
					</ContextMenuItem>
					<ContextMenuItem onClick={removeAll}>Remove All</ContextMenuItem>
					<ContextMenuSub>
						<ContextMenuSubTrigger>Parse timeline from file</ContextMenuSubTrigger>
						<ContextMenuSubContent>
							<Command>
								<CommandInput placeholder="search file path"/>
								<CommandList>
									<CommandEmpty>No file selected</CommandEmpty>
									<CommandGroup>
										{markdownFiles.map(f => (
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
