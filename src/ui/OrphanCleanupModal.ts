import {App, Modal, Notice, TFile} from "obsidian";

export class OrphanCleanupModal extends Modal {
	constructor(app: App, private orphans: TFile[]) {
		super(app);
	}

	override onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h2", {text: "Orphaned timeline data files"});
		contentEl.createEl("p", {
			text: `Found ${this.orphans.length} data file${this.orphans.length === 1 ? "" : "s"} with no matching historica block in the vault:`
		});

		const list = contentEl.createEl("ul", {cls: "historica-orphan-list"});
		for (const f of this.orphans) {
			list.createEl("li", {text: f.path});
		}

		const btnRow = contentEl.createDiv({cls: "historica-orphan-btn-row"});

		const cancelBtn = btnRow.createEl("button", {text: "Cancel"});
		cancelBtn.addEventListener("click", () => this.close());

		const deleteBtn = btnRow.createEl("button", {
			text: `Delete ${this.orphans.length} file${this.orphans.length === 1 ? "" : "s"}`,
			cls: "historica-orphan-delete-btn",
		});
		deleteBtn.addEventListener("click", () => {
			void this.performDelete();
		});
	}

	private async performDelete() {
		let deleted = 0;
		for (const f of this.orphans) {
			try {
				await this.app.fileManager.trashFile(f);
				deleted++;
			} catch {
				new Notice(`Failed to delete ${f.path}`);
			}
		}
		new Notice(`Deleted ${deleted} orphaned data file${deleted === 1 ? "" : "s"}`);
		this.close();
	}

	override onClose() {
		this.contentEl.empty();
	}
}
