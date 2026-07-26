import { App, PluginSettingTab, type SettingDefinitionItem } from "obsidian";
import type HistoricaPlugin from "@/main";
import { DEFAULT_PLUGIN_SETTINGS } from "@/src/types";

export class HistoricaSettingsTab extends PluginSettingTab {
	constructor(app: App, private plugin: HistoricaPlugin) {
		super(app, plugin);
	}

	// The declarative API defaults to reading and writing `plugin.settings`.
	// This plugin keeps its settings on `pluginSettings` and persists them
	// through `savePluginSettings()`, so both accessors are redirected rather
	// than the storage being moved to suit the framework.
	override getControlValue(key: string): unknown {
		return this.plugin.pluginSettings[key as keyof typeof this.plugin.pluginSettings];
	}

	override async setControlValue(key: string, value: unknown): Promise<void> {
		Object.assign(this.plugin.pluginSettings, { [key]: value });
		await this.plugin.savePluginSettings();
	}

	override getSettingDefinitions(): SettingDefinitionItem[] {
		const index = this.plugin.vaultIndex.getIndex();
		const totalEvents = Object.values(index).reduce((sum, e) => sum + e.entryCount, 0);
		const totalNotes = new Set(Object.values(index).map(e => e.notePath).filter(Boolean)).size;
		const totalBlocks = Object.keys(index).length;

		return [
			{
				name: "Date display format",
				desc: "moment.js format string used when displaying dates in timeline cards (e.g. MMM D, YYYY · YYYY-MM-DD).",
				control: {
					type: "text",
					key: "dateDisplayFormat",
					placeholder: DEFAULT_PLUGIN_SETTINGS.dateDisplayFormat,
					defaultValue: DEFAULT_PLUGIN_SETTINGS.dateDisplayFormat,
					// display() used to silently swap a blank value for the default,
					// which left the field looking empty while dates rendered in a
					// format the user had not chosen. Rejecting says so instead.
					validate: value => value.trim() ? undefined : "Enter a format string, for example MMM D, YYYY.",
				},
			},
			{
				name: "Parsing language",
				desc: "Language used for date extraction. Auto-detect picks the language from the note text (recommended). Per-block overrides are set with language: <code> in the block.",
				control: {
					type: "dropdown",
					key: "language",
					defaultValue: "auto",
					options: {
						auto: "Auto-detect",
						en: "English",
						de: "Deutsch",
						fr: "Français",
						ja: "日本語",
						zh: "中文",
						nl: "Nederlands",
					},
				},
			},
			{
				type: "group",
				heading: "Advanced",
				items: [
					{
						name: "Data directory",
						// "Historica" stays capitalized here on purpose: it is the plugin's own brand name,
						// same as "Obsidian" would be. The obsidianmd/ui/sentence-case rule doesn't have
						// this plugin's own name in its default brand list, so it flags this as a false
						// positive. Known and accepted; not suppressed.
						desc: "Vault-relative folder where Historica stores timeline data files. Changing this does not move existing files - rename the folder manually first.",
						control: {
							type: "text",
							key: "dataDir",
							placeholder: DEFAULT_PLUGIN_SETTINGS.dataDir,
							defaultValue: DEFAULT_PLUGIN_SETTINGS.dataDir,
							validate: value => value.trim() ? undefined : "Enter a folder path.",
						},
					},
				],
			},
			{
				type: "group",
				heading: "Vault index",
				items: [
					{
						name: "Events indexed",
						desc: `${totalEvents.toLocaleString()} timeline entries across all parsed notes.`,
					},
					{
						name: "Notes parsed",
						desc: `${totalNotes.toLocaleString()} notes with at least one historica block.`,
					},
					{
						name: "Timeline blocks",
						desc: `${totalBlocks.toLocaleString()} historica blocks tracked in the vault index.`,
					},
				],
			},
		];
	}
}
