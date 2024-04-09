import {TimelineEntryChrono} from "./GetTimelineDataFromDocumentArray";
import {FormatSentencesWithMarkElement} from "./FormatSentencesWithMarkElement";
import {setIcon} from "obsidian";
import {HistoricaSearchResultModal} from "./SearchResultModal";
import {TimelineActionModal} from "./TimelineActionModal";
import isMobile from "ismobilejs";
import {HistoricaSetting} from "./historicaSettingTab";
import HistoricaPlugin from "../main";
import {HistoricaBlockConfig} from "./verifyBlockConfig";

export async function renderTimelineEntry(currentPlugin: HistoricaPlugin,
										  timelineData: TimelineEntryChrono[],
										  blockConfig: HistoricaBlockConfig,
										  el: HTMLElement) {


	if (blockConfig.style === 1) {
		const historicaEntryClass = blockConfig.smart_theme ? "historica-entry-1-smart-theme group" : "historica-entry-1 group"
		const historicaVerticalLineClass = blockConfig.smart_theme ? "historica-vertical-line-1-smart-theme" : "historica-vertical-line-1"
		const historicaTimeClass = blockConfig.smart_theme ? "historica-time-1-smart-theme" : "historica-time-1"
		const historicaTitleClass = blockConfig.smart_theme ? "historica-title-1-smart-theme" : "historica-title-1"
		const historicaContentClass = blockConfig.smart_theme ? "historica-content-1-smart-theme" : "historica-content-1"
		const historicaContainerClass = blockConfig.smart_theme ? "historica-container-1-smart-theme" : "historica-container-1"

		const timelineEl = el.createEl('div', {
			cls: historicaContainerClass
		})
		// console.log(isMobile())
		timelineEl.addEventListener("contextmenu", async (e) => {
			e.preventDefault()
			new TimelineActionModal(currentPlugin.app, timelineEl, currentPlugin, timelineData, blockConfig.smart_theme).open()
		})


		timelineData.map((entry) => {
			const timelineEntryEl = timelineEl.createEl('div', {
				cls: historicaEntryClass
			})
			// timelineEntryEl.createEl('div', {cls: "historica-label", text: entry.importantInformation})
			const verticalLine = timelineEntryEl.createEl('div', {cls: historicaVerticalLineClass})
			console.log(entry.dateStringCompact)
			if (blockConfig.implicit_time) {
				verticalLine.createEl('time', {cls: historicaTimeClass, text: entry.stringThatParseAsDate})
			} else {
				verticalLine.createEl('time', {cls: historicaTimeClass, text: entry.dateStringCompact})
			}
			verticalLine.createEl('div', {cls: historicaTitleClass, text: entry.importantInformation})
			const historicaContent = timelineEntryEl.createEl('div', {cls: historicaContentClass})
			historicaContent.addEventListener('click', async () => {

				new HistoricaSearchResultModal(currentPlugin.app, entry.stringThatParseAsDate, currentPlugin, blockConfig.smart_theme).open()
			})
			FormatSentencesWithMarkElement(entry.sentence, historicaContent, blockConfig.smart_theme)

		})
	} else if (blockConfig.style === 2) {
		let historicaCardTimeClass: string, historicaCardClass: string, historicaCardContainerClass: string,
			historicaCardTitleClass: string, historicaContainerClass: string, historicaTimelineIconClass: string,
			historicaTimelineItemClass: string, historicaCardContentClass: string;
		if (blockConfig.smart_theme) {
			historicaContainerClass = "historica-container-2-smart-theme"
			historicaTimelineItemClass = "historica-item-2-smart-theme group"
			historicaTimelineIconClass = "historica-icon-2-smart-theme"
			historicaCardContainerClass = "historica-card-container-2-smart-theme"
			historicaCardClass = "historica-card-2-smart-theme"
			historicaCardTitleClass = "historica-card-title-2-smart-theme"
			historicaCardTimeClass = "historica-card-time-2-smart-theme"
			historicaCardContentClass = "historica-card-content-2-smart-theme"

		} else {
			historicaContainerClass = "historica-container-2"
			historicaTimelineItemClass = "historica-item-2 group"
			historicaTimelineIconClass = "historica-icon-2"
			historicaCardContainerClass = "historica-card-container-2"
			historicaCardClass = "historica-card-2"
			historicaCardTitleClass = "historica-card-title-2"
			historicaCardTimeClass = "historica-card-time-2"
			historicaCardContentClass = "historica-card-content-2"
		}
		const timelineContainer = el.createEl('div', {
			cls: historicaContainerClass
		})
		timelineContainer.addEventListener("contextmenu", async (e) => {
			e.preventDefault()
			new TimelineActionModal(currentPlugin.app,
				timelineContainer, currentPlugin,
				timelineData, blockConfig.smart_theme).open()
		})

		timelineData.map((entry) => {
			const timelineItem = timelineContainer.createEl('div', {
				cls: historicaTimelineItemClass
			})
			const timelineIcon = timelineItem.createEl('div', {
				cls: historicaTimelineIconClass
			})
			const timelineCardContainer = timelineItem.createEl('div', {
				cls: historicaCardContainerClass
			})

			setIcon(timelineIcon, "shell")


			const timelineCard = timelineCardContainer.createEl('div', {
				cls: historicaCardClass

			})
			timelineCard.createEl('div', {
				cls: historicaCardTitleClass,
				text: entry.importantInformation
			})
			if (blockConfig.implicit_time) {
				timelineCard.createEl('div', {
					cls: historicaCardTimeClass,
					text: entry.stringThatParseAsDate
				})
			} else {
				timelineCard.createEl('div', {
					cls: historicaCardTimeClass,
					text: entry.dateStringCompact
				})
			}

			const timelineCardContent = timelineCardContainer.createEl('div', {
				cls: historicaCardContentClass,

			})

			FormatSentencesWithMarkElement(entry.sentence, timelineCardContent, blockConfig.smart_theme)
			timelineCardContent.addEventListener('click', async () => {

				new HistoricaSearchResultModal(currentPlugin.app, entry.stringThatParseAsDate, currentPlugin, blockConfig.smart_theme).open()
			})
		})

	}
}


