import {ItemView, WorkspaceLeaf} from "obsidian";
import {createRoot, Root} from "react-dom/client";
import {StrictMode} from "react";
import {DesignGallery} from "@/src/ui/DesignGallery";
import {HISTORICA_ICON_ID} from "@/src/ui/historicaIcon";

export const HISTORICA_GALLERY_VIEW_TYPE = "historica-design-gallery";

export class DesignGalleryView extends ItemView {
	private reactRoot: Root | null = null;

	constructor(leaf: WorkspaceLeaf, _plugin: unknown) {
		super(leaf);
	}

	override getViewType(): string {
		return HISTORICA_GALLERY_VIEW_TYPE;
	}

	override getDisplayText(): string {
		return "Historica design gallery";
	}

	override getIcon(): string {
		return HISTORICA_ICON_ID;
	}

	override async onOpen(): Promise<void> {
		this.contentEl.empty();
		this.contentEl.addClass("historica-view-content");
		this.reactRoot = createRoot(this.contentEl);
		this.reactRoot.render(
			<StrictMode>
				<DesignGallery />
			</StrictMode>
		);
	}

	override async onClose(): Promise<void> {
		this.reactRoot?.unmount();
		this.reactRoot = null;
	}
}
