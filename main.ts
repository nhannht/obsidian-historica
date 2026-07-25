import {Notice, Plugin, addIcon} from 'obsidian';
import HistoricaBlockManager from "@/src/backgroundLogic/HistoricaBlockManager";
import HistoricaChrono from "@/src/compute/ChronoParser";
import {registerHmdPostProcessor} from "@/src/data/HmdPostProcessor";
import {hmdEditorExtension} from "@/src/data/HmdEditorExtension";
import {findOrphanedDataFiles} from "@/src/utils";
import {OrphanCleanupModal} from "@/src/ui/OrphanCleanupModal";
import {HISTORICA_SIDEBAR_VIEW_TYPE, HistoricaSidebarView} from "@/src/ui/HistoricaSidebarView";
import {HISTORICA_GLOBAL_VIEW_TYPE, GlobalTimelineView} from "@/src/ui/GlobalTimelineView";
import {HISTORICA_GALLERY_VIEW_TYPE, DesignGalleryView} from "@/src/ui/DesignGalleryView";
import {HistoricaSettingsTab} from "@/src/ui/HistoricaSettingsTab";
import {HistoricaPluginSettings, DEFAULT_PLUGIN_SETTINGS} from "@/src/types";
import {VaultIndexManager} from "@/src/data/VaultIndexManager";
import {HISTORICA_ICON_ID, HISTORICA_ICON_SVG} from "@/src/ui/historicaIcon";

export default class HistoricaPlugin extends Plugin {
	historicaChrono = new HistoricaChrono()
	blockManager = new HistoricaBlockManager(this)
	vaultIndex = new VaultIndexManager(this)
	pluginSettings: HistoricaPluginSettings = { ...DEFAULT_PLUGIN_SETTINGS }


	get dataDir(): string {
		return this.pluginSettings.dataDir;
	}

	async loadPluginSettings(): Promise<void> {
		const savedData = await this.loadData() as Partial<HistoricaPluginSettings> | null;
		this.pluginSettings = Object.assign({}, DEFAULT_PLUGIN_SETTINGS, savedData ?? {});
	}

	async savePluginSettings(): Promise<void> {
		await this.saveData(this.pluginSettings);
	}

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
		// Must precede registerView/addRibbonIcon - both resolve the icon by id.
		addIcon(HISTORICA_ICON_ID, HISTORICA_ICON_SVG)
		await this.loadPluginSettings()
		this.darkModeAdapt()
		this.vaultIndex.buildFull().catch(console.error)
		this.registerListener()
		this.addSettingTab(new HistoricaSettingsTab(this.app, this))
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

		this.registerView(
			HISTORICA_GALLERY_VIEW_TYPE,
			(leaf) => new DesignGalleryView(leaf, this)
		);

		this.addRibbonIcon(HISTORICA_ICON_ID, "Open historica timeline sidebar", () => {
			this.activateSidebar().catch((error: unknown) => {
				console.error("Historica: failed to open timeline sidebar", error);
				new Notice("Historica: failed to open timeline sidebar");
			});
		});

		this.addRibbonIcon(HISTORICA_ICON_ID, "Open historica global timeline", () => {
			this.activateGlobalTimeline().catch((error: unknown) => {
				console.error("Historica: failed to open global timeline", error);
				new Notice("Historica: failed to open global timeline");
			});
		});

		this.addCommand({
			id: "open-historica-sidebar",
			name: "Open timeline sidebar",
			callback: () => this.activateSidebar(),
		});

		this.addCommand({
			id: "open-historica-global-timeline",
			name: "Open global timeline",
			callback: () => this.activateGlobalTimeline(),
		});

		this.addCommand({
			id: "open-historica-design-gallery",
			name: "Open design gallery",
			callback: () => this.activateGallery(),
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
			existing[0].detach();
			return;
		}
		const leaf = this.app.workspace.getRightLeaf(false);
		await leaf?.setViewState({type: HISTORICA_SIDEBAR_VIEW_TYPE, active: true});
		if (leaf) await this.app.workspace.revealLeaf(leaf);
	}

	async activateGlobalTimeline(): Promise<void> {
		return this.activateTabView(HISTORICA_GLOBAL_VIEW_TYPE);
	}

	async activateGallery(): Promise<void> {
		return this.activateTabView(HISTORICA_GALLERY_VIEW_TYPE);
	}

	private async activateTabView(viewType: string): Promise<void> {
		const existing = this.app.workspace.getLeavesOfType(viewType);
		if (existing.length > 0) {
			await this.app.workspace.revealLeaf(existing[0]);
			return;
		}
		const leaf = this.app.workspace.getLeaf("tab");
		await leaf.setViewState({type: viewType, active: true});
		await this.app.workspace.revealLeaf(leaf);
	}

	override onunload() {
	}
}
