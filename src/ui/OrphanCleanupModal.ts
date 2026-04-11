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
		list.style.cssText = "max-height:200px;overflow-y:auto;margin:8px 0;padding-left:1.5em;font-family:monospace;font-size:0.85em";
		for (const f of this.orphans) {
			list.createEl("li", {text: f.path});
		}

		const btnRow = contentEl.createDiv();
		btnRow.style.cssText = "display:flex;gap:8px;justify-content:flex-end;margin-top:16px";

		const cancelBtn = btnRow.createEl("button", {text: "Cancel"});
		cancelBtn.addEventListener("click", () => this.close());

		const deleteBtn = btnRow.createEl("button", {text: `Delete ${this.orphans.length} file${this.orphans.length === 1 ? "" : "s"}`});
		deleteBtn.style.cssText = "background:var(--color-red);color:white;border:none;padding:4px 12px;border-radius:4px;cursor:pointer";
		deleteBtn.addEventListener("click", async () => {
			let deleted = 0;
			for (const f of this.orphans) {
				try {
					await this.app.vault.delete(f);
					deleted++;
				} catch {
					new Notice(`Failed to delete ${f.path}`);
				}
			}
			new Notice(`Deleted ${deleted} orphaned data file${deleted === 1 ? "" : "s"}`);
			this.close();
		});
	}

	override onClose() {
		this.contentEl.empty();
	}
}
