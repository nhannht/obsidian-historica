import {ItemView, WorkspaceLeaf} from "obsidian";
import {createRoot, Root} from "react-dom/client";
import {StrictMode} from "react";
import HistoricaPlugin from "@/main";
import {createTimelineStore} from "@/src/store/createTimelineStore";
import {BlockInfo, SidebarShell} from "@/src/ui/SidebarShell";
import {extractBlockId} from "@/src/backgroundLogic/HistoricaBlockManager";
import {DefaultSettings, HistoricaSettings} from "@/src/types";

export const HISTORICA_SIDEBAR_VIEW_TYPE = "historica-sidebar";

export class HistoricaSidebarView extends ItemView {
	private plugin: HistoricaPlugin;
	private reactRoot: Root | null = null;
	private destroyStore: (() => void) | null = null;
	private currentBlockId: string | null = null;
	private currentBlockIds: string = "";

	constructor(leaf: WorkspaceLeaf, plugin: HistoricaPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	override getViewType(): string {
		return HISTORICA_SIDEBAR_VIEW_TYPE;
	}

	override getDisplayText(): string {
		return "Historica Timeline";
	}

	override getIcon(): string {
		return "calendar-clock";
	}

	override async onOpen(): Promise<void> {
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				if (leaf === this.leaf) return;
				this.refresh();
			})
		);
		// Only full-refresh when the set of blockIds in the active file changes —
		// e.g. first parse writes a blockId. Routine saves are handled by Zustand.
		this.registerEvent(
			this.app.vault.on("modify", async (file) => {
				if (file !== this.app.workspace.getActiveFile()) return;
				const content = await this.app.vault.read(file);
				const blocks = this.findBlocks(content);
				const ids = JSON.stringify(blocks.map(b => b.blockId));
				if (ids !== this.currentBlockIds) this.refresh();
			})
		);
		await this.refresh();
	}

	override async onClose(): Promise<void> {
		this.reactRoot?.unmount();
		this.destroyStore?.();
		this.currentBlockId = null;
		this.currentBlockIds = "";
	}

	private findBlocks(content: string): BlockInfo[] {
		const blocks: BlockInfo[] = [];
		const regex = /```historica\n([\s\S]*?)```/g;
		let match;
		let count = 0;
		while ((match = regex.exec(content)) !== null) {
			count++;
			const blockId = extractBlockId(match[1]);
			const textBefore = content.substring(0, match.index);
			const lines = textBefore.split("\n");
			let label = `Block ${count}`;
			for (let i = lines.length - 1; i >= 0; i--) {
				const line = lines[i].trim();
				if (line.startsWith("#")) {
					label = line.replace(/^#+\s*/, "");
					break;
				}
			}
			blocks.push({ blockId, label });
		}
		return blocks;
	}

	private selectBlock(blockId: string, allBlocks: BlockInfo[]): void {
		this.destroyStore?.();
		this.destroyStore = null;
		this.currentBlockId = blockId;

		const settings: HistoricaSettings = { ...DefaultSettings, blockId };
		const { store, destroy } = createTimelineStore(this.plugin, settings);
		this.destroyStore = destroy;

		this.reactRoot?.render(
			<StrictMode>
				<SidebarShell
					blocks={allBlocks}
					selectedId={blockId}
					onSelect={(id) => this.selectBlock(id, allBlocks)}
					store={store}
					plugin={this.plugin}
				/>
			</StrictMode>
		);
	}

	async refresh(): Promise<void> {
		this.reactRoot?.unmount();
		this.destroyStore?.();
		this.reactRoot = null;
		this.destroyStore = null;
		this.currentBlockId = null;
		this.currentBlockIds = "";

		const file = this.app.workspace.getActiveFile();
		if (!file) {
			this.renderPlaceholder("No active note");
			return;
		}

		const content = await this.app.vault.read(file);
		const allBlocks = this.findBlocks(content);
		const validBlocks = allBlocks.filter(b => b.blockId !== "-1");

		this.currentBlockIds = JSON.stringify(allBlocks.map(b => b.blockId));

		if (validBlocks.length === 0) {
			const hasBlock = allBlocks.length > 0;
			this.renderPlaceholder(
				hasBlock
					? "Timeline not yet saved\u2014parse the file first"
					: "No historica block in this note"
			);
			return;
		}

		// Prefer previously selected block if still present, else first valid
		const targetId =
			validBlocks.find(b => b.blockId === this.currentBlockId)?.blockId
			?? validBlocks[0].blockId;

		this.currentBlockId = targetId;
		const settings: HistoricaSettings = { ...DefaultSettings, blockId: targetId };
		const { store, destroy } = createTimelineStore(this.plugin, settings);
		this.destroyStore = destroy;

		this.contentEl.empty();
		this.reactRoot = createRoot(this.contentEl);
		this.reactRoot.render(
			<StrictMode>
				<SidebarShell
					blocks={validBlocks}
					selectedId={targetId}
					onSelect={(id) => this.selectBlock(id, validBlocks)}
					store={store}
					plugin={this.plugin}
				/>
			</StrictMode>
		);
	}

	private renderPlaceholder(message: string): void {
		this.contentEl.empty();
		this.contentEl.createEl("div", {
			text: message,
			cls: "historica-sidebar-placeholder",
		});
	}
}
