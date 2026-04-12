import {Notice, Plugin, TFile} from 'obsidian';
import HistoricaBlockManager from "@/src/backgroundLogic/HistoricaBlockManager";
import HistoricaChrono from "@/src/compute/ChronoParser";
import {registerHmdPostProcessor} from "@/src/data/HmdPostProcessor";
import {hmdEditorExtension} from "@/src/data/HmdEditorExtension";
import {findOrphanedDataFiles} from "@/src/utils";
import {OrphanCleanupModal} from "@/src/ui/OrphanCleanupModal";
import {HISTORICA_SIDEBAR_VIEW_TYPE, HistoricaSidebarView} from "@/src/ui/HistoricaSidebarView";
import {HISTORICA_GLOBAL_VIEW_TYPE, GlobalTimelineView} from "@/src/ui/GlobalTimelineView";
import {extractBlockId} from "@/src/backgroundLogic/HistoricaBlockManager";
import {createTimelineStore} from "@/src/store/createTimelineStore";
import {DefaultSettings, HistoricaSettings} from "@/src/types";
import {VaultIndexManager} from "@/src/data/VaultIndexManager";

export default class HistoricaPlugin extends Plugin {
	historicaChrono = new HistoricaChrono()
	blockManager = new HistoricaBlockManager(this)
	vaultIndex = new VaultIndexManager(this)
	private parseTimers = new Map<string, ReturnType<typeof setTimeout>>()

	darkModeAdapt = () => {
		if (document.body.hasClass("theme-dark")) {
			document.body.addClass("dark")
		} else {
			document.body.removeClass("dark")
		}
	}

	registerListener() {
		this.registerEvent(this.app.workspace.on("css-change", () => {
			this.darkModeAdapt()
		}))

		this.registerEvent(this.app.vault.on("modify", (file) => {
			if (!(file instanceof TFile) || file.extension !== "md") return;

			const existing = this.parseTimers.get(file.path);
			if (existing) clearTimeout(existing);

			const timer = setTimeout(async () => {
				this.parseTimers.delete(file.path);
				await this.autoParseFile(file);
			}, 1000);

			this.parseTimers.set(file.path, timer);
		}));
	}

	override async onload() {
		this.darkModeAdapt()
		this.vaultIndex.buildFull().catch(console.error)
		this.registerListener()
		registerHmdPostProcessor(this);
		this.registerEditorExtension(hmdEditorExtension(this));
		await this.blockManager.registerHistoricaBlockNg()

		this.registerView(
			HISTORICA_SIDEBAR_VIEW_TYPE,
			(leaf) => new HistoricaSidebarView(leaf, this)
		);

		this.registerView(
			HISTORICA_GLOBAL_VIEW_TYPE,
			(leaf) => new GlobalTimelineView(leaf, this)
		);

		this.addRibbonIcon("calendar-clock", "Open Historica Timeline Sidebar", () => {
			this.activateSidebar();
		});

		this.addRibbonIcon("globe", "Open Historica Global Timeline", () => {
			this.activateGlobalTimeline();
		});

		this.addCommand({
			id: "open-historica-sidebar",
			name: "Open Timeline Sidebar",
			callback: () => this.activateSidebar(),
		});

		this.addCommand({
			id: "open-historica-global-timeline",
			name: "Open Global Timeline",
			callback: () => this.activateGlobalTimeline(),
		});

		this.addCommand({
			id: "clean-orphaned-data-files",
			name: "Clean up orphaned timeline data files",
			callback: async () => {
				const orphans = await findOrphanedDataFiles(this);
				if (orphans.length === 0) {
					new Notice("No orphaned data files found");
					return;
				}
				new OrphanCleanupModal(this.app, orphans).open();
			}
		});
	}

	async activateSidebar(): Promise<void> {
		const existing = this.app.workspace.getLeavesOfType(HISTORICA_SIDEBAR_VIEW_TYPE);
		if (existing.length > 0) {
			// Toggle: already open → close it
			existing[0].detach();
			return;
		}
		const leaf = this.app.workspace.getRightLeaf(false);
		await leaf?.setViewState({type: HISTORICA_SIDEBAR_VIEW_TYPE, active: true});
		if (leaf) this.app.workspace.revealLeaf(leaf);
	}

	async activateGlobalTimeline(): Promise<void> {
		const existing = this.app.workspace.getLeavesOfType(HISTORICA_GLOBAL_VIEW_TYPE);
		if (existing.length > 0) {
			// Already open — reveal and focus it
			this.app.workspace.revealLeaf(existing[0]);
			return;
		}
		const leaf = this.app.workspace.getLeaf("tab");
		await leaf.setViewState({type: HISTORICA_GLOBAL_VIEW_TYPE, active: true});
		this.app.workspace.revealLeaf(leaf);
	}


	private async autoParseFile(file: TFile): Promise<void> {
		const content = await this.app.vault.read(file);
		const match = content.match(/```historica\n([\s\S]*?)```/);
		if (!match) return;

		const blockId = extractBlockId(match[1]);
		if (blockId === "-1") return;

		const settings: HistoricaSettings = {...DefaultSettings, blockId};
		const {store, destroy} = createTimelineStore(this, settings);
		try {
			await store.getState().load();
			await store.getState().parseFromFile(file.path, true);
		} finally {
			destroy();
		}
	}

	override async onunload() {
		for (const timer of this.parseTimers.values()) clearTimeout(timer);
		this.parseTimers.clear();
	}
}
