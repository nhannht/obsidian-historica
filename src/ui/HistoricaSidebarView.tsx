import {ItemView, WorkspaceLeaf} from "obsidian";
import {createRoot, Root} from "react-dom/client";
import {StrictMode} from "react";
import HistoricaPlugin from "@/main";
import {createTimelineStore} from "@/src/store/createTimelineStore";
import {TimelineBlock} from "@/src/ui/TimelineBlock";
import {extractBlockId} from "@/src/backgroundLogic/HistoricaBlockManager";
import {DefaultSettings, HistoricaSettings} from "@/src/types";

export const HISTORICA_SIDEBAR_VIEW_TYPE = "historica-sidebar";

export class HistoricaSidebarView extends ItemView {
	private plugin: HistoricaPlugin;
	private reactRoot: Root | null = null;
	private destroyStore: (() => void) | null = null;
	private currentBlockId: string | null = null;

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
		// Only full-refresh when the blockId in the active file changes —
		// e.g. first parse writes blockId. Routine saves are handled by the
		// Zustand store subscription and don't need a React tree teardown.
		this.registerEvent(
			this.app.vault.on("modify", async (file) => {
				if (file !== this.app.workspace.getActiveFile()) return;
				const content = await this.app.vault.read(file);
				const match = content.match(/```historica\n([\s\S]*?)```/);
				if (!match) return;
				const newBlockId = extractBlockId(match[1]);
				if (newBlockId !== this.currentBlockId) this.refresh();
			})
		);
		await this.refresh();
	}

	override async onClose(): Promise<void> {
		this.reactRoot?.unmount();
		this.destroyStore?.();
		this.currentBlockId = null;
	}

	async refresh(): Promise<void> {
		this.reactRoot?.unmount();
		this.destroyStore?.();
		this.reactRoot = null;
		this.destroyStore = null;
		this.currentBlockId = null;

		const file = this.app.workspace.getActiveFile();
		if (!file) {
			this.renderPlaceholder("No active note");
			return;
		}

		const content = await this.app.vault.read(file);
		const match = content.match(/```historica\n([\s\S]*?)```/);
		if (!match) {
			this.renderPlaceholder("No historica block in this note");
			return;
		}

		const blockId = extractBlockId(match[1]);
		if (blockId === "-1") {
			this.renderPlaceholder("Timeline not yet saved\u2014open the note and parse the file first");
			return;
		}

		this.currentBlockId = blockId;

		const settings: HistoricaSettings = {...DefaultSettings, blockId};
		const {store, destroy} = createTimelineStore(this.plugin, settings);
		this.destroyStore = destroy;

		this.contentEl.empty();
		this.reactRoot = createRoot(this.contentEl);
		this.reactRoot.render(
			<StrictMode>
				<TimelineBlock store={store} plugin={this.plugin}/>
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
