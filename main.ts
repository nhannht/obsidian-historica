import {Notice, Plugin} from 'obsidian';
import HistoricaBlockManager from "@/src/backgroundLogic/HistoricaBlockManager";
import HistoricaChrono from "@/src/compute/ChronoParser";
import {registerHmdPostProcessor} from "@/src/data/HmdPostProcessor";
import {hmdEditorExtension} from "@/src/data/HmdEditorExtension";
import {findOrphanedDataFiles} from "@/src/utils";
import {OrphanCleanupModal} from "@/src/ui/OrphanCleanupModal";
import {HISTORICA_SIDEBAR_VIEW_TYPE, HistoricaSidebarView} from "@/src/ui/HistoricaSidebarView";

export default class HistoricaPlugin extends Plugin {
	historicaChrono = new HistoricaChrono()
	blockManager = new HistoricaBlockManager(this)

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
	}

	override async onload() {
		this.darkModeAdapt()
		this.registerListener()
		registerHmdPostProcessor(this);
		this.registerEditorExtension(hmdEditorExtension(this));
		await this.blockManager.registerHistoricaBlockNg()

		this.registerView(
			HISTORICA_SIDEBAR_VIEW_TYPE,
			(leaf) => new HistoricaSidebarView(leaf, this)
		);

		this.addRibbonIcon("calendar-clock", "Open Historica Timeline Sidebar", () => {
			this.activateSidebar();
		});

		this.addCommand({
			id: "open-historica-sidebar",
			name: "Open Timeline Sidebar",
			callback: () => this.activateSidebar(),
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

	override async onunload() {
	}
}
