import { App, PluginSettingTab, Setting } from "obsidian";
import type HistoricaPlugin from "@/main";

export class HistoricaSettingsTab extends PluginSettingTab {
	constructor(app: App, private plugin: HistoricaPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Date display format")
			.setDesc("moment.js format string used when displaying dates in timeline cards (e.g. MMM D, YYYY · YYYY-MM-DD).")
			.addText(text =>
				text
					.setPlaceholder("MMM D, YYYY")
					.setValue(this.plugin.pluginSettings.dateDisplayFormat)
					.onChange(async value => {
						this.plugin.pluginSettings.dateDisplayFormat = value.trim() || "MMM D, YYYY";
						await this.plugin.savePluginSettings();
					})
			);

		new Setting(containerEl)
			.setName("Parsing language")
			.setDesc("Language used for date extraction. Auto-detect picks the language from the note text (recommended). Per-block overrides are set with language: <code> in the block.")
			.addDropdown(dropdown =>
				dropdown
					.addOption("auto", "Auto-detect")
					.addOption("en", "English")
					.addOption("de", "Deutsch")
					.addOption("fr", "Français")
					.addOption("ja", "日本語")
					.addOption("zh", "中文")
					.addOption("nl", "Nederlands")
					.setValue(this.plugin.pluginSettings.language ?? "auto")
					.onChange(async value => {
						this.plugin.pluginSettings.language = value;
						await this.plugin.savePluginSettings();
					})
			);

		// ── Advanced ───────────────────────────────────────────────────────────
		new Setting(containerEl).setName("Advanced").setHeading();

		new Setting(containerEl)
			.setName("Data directory")
			.setDesc("Vault-relative folder where Historica stores timeline data files. Changing this does not move existing files — rename the folder manually first.")
			.addText(text =>
				text
					.setPlaceholder("historica-data")
					.setValue(this.plugin.pluginSettings.dataDir)
					.onChange(async value => {
						const trimmed = value.trim();
						if (trimmed) {
							this.plugin.pluginSettings.dataDir = trimmed;
							await this.plugin.savePluginSettings();
						}
					})
			);

		// ── Vault stats (read-only) ────────────────────────────────────────────
		new Setting(containerEl).setName("Vault index").setHeading();

		const index = this.plugin.vaultIndex.getIndex();
		const totalEvents = Object.values(index).reduce((sum, e) => sum + e.entryCount, 0);
		const totalNotes = new Set(Object.values(index).map(e => e.notePath).filter(Boolean)).size;
		const totalBlocks = Object.keys(index).length;

		new Setting(containerEl)
			.setName("Events indexed")
			.setDesc("Total timeline entries across all parsed notes.")
			.addText(text => text.setValue(totalEvents.toLocaleString()).setDisabled(true));

		new Setting(containerEl)
			.setName("Notes parsed")
			.setDesc("Unique notes with at least one historica block.")
			.addText(text => text.setValue(totalNotes.toLocaleString()).setDisabled(true));

		new Setting(containerEl)
			.setName("Timeline blocks")
			.setDesc("Total historica blocks tracked in the vault index.")
			.addText(text => text.setValue(totalBlocks.toLocaleString()).setDisabled(true));
	}
}
