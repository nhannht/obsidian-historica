import {ItemView, WorkspaceLeaf} from "obsidian";
import {createRoot, Root} from "react-dom/client";
import {StrictMode} from "react";
import {DesignGallery} from "@/src/ui/DesignGallery";

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
		return "Historica Design Gallery";
	}

	override getIcon(): string {
		return "palette";
	}

	override async onOpen(): Promise<void> {
		this.contentEl.empty();
		this.contentEl.style.display = "flex";
		this.contentEl.style.flexDirection = "column";
		this.contentEl.style.height = "100%";
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
