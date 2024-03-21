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
	const settings: HistoricaSetting = await currentPlugin.loadData()
	const isShowRelativeTime = blockConfig.implicit_time !== undefined ? blockConfig.implicit_time : settings.showRelativeTime
	const isUsingSmartTheme = blockConfig.smart_theme !== undefined ? blockConfig.smart_theme : settings.usingSmartTheme

	const style = blockConfig.style !== undefined ? blockConfig.style : settings.defaultStyle


	if (style === 1) {
		const historicaEntryClass = isUsingSmartTheme ? "historica-entry-1-smart-theme group" : "historica-entry-1 group"
		const historicaVerticalLineClass = isUsingSmartTheme ? "historica-vertical-line-1-smart-theme" : "historica-vertical-line-1"
		const historicaTimeClass = isUsingSmartTheme ? "historica-time-1-smart-theme" : "historica-time-1"
		const historicaTitleClass = isUsingSmartTheme ? "historica-title-1-smart-theme" : "historica-title-1"
		const historicaContentClass = isUsingSmartTheme ? "historica-content-1-smart-theme" : "historica-content-1"
		const historicaContainerClass = isUsingSmartTheme ? "historica-container-1-smart-theme" : "historica-container-1"

		const timelineEl = el.createEl('div', {
			cls: historicaContainerClass
		})
		// console.log(isMobile())
		if (!isMobile().any) {
			timelineEl.addEventListener("contextmenu", async (e) => {
				e.preventDefault()
				new TimelineActionModal(currentPlugin.app, timelineEl, currentPlugin, timelineData, isUsingSmartTheme).open()
			})
		}


		timelineData.map((entry) => {
			const timelineEntryEl = timelineEl.createEl('div', {
				cls: historicaEntryClass
			})
			// timelineEntryEl.createEl('div', {cls: "historica-label", text: entry.importantInformation})
			const verticalLine = timelineEntryEl.createEl('div', {cls: historicaVerticalLineClass})
			if (isShowRelativeTime) {
				verticalLine.createEl('time', {cls: historicaTimeClass, text: entry.stringThatParseAsDate})
			} else {
				verticalLine.createEl('time', {cls: historicaTimeClass, text: entry.dateStringCompact})
			}
			verticalLine.createEl('div', {cls: historicaTitleClass, text: entry.importantInformation})
			const historicaContent = timelineEntryEl.createEl('div', {cls: historicaContentClass})
			historicaContent.addEventListener('click', async () => {

				new HistoricaSearchResultModal(currentPlugin.app, entry.stringThatParseAsDate, currentPlugin, isUsingSmartTheme).open()
			})
			FormatSentencesWithMarkElement(entry.sentence, historicaContent, isUsingSmartTheme)

		})
	} else if (style === 2) {
		let historicaCardTimeClass: string, historicaCardClass: string, historicaCardContainerClass: string,
			historicaCardTitleClass: string, historicaContainerClass: string, historicaTimelineIconClass: string,
			historicaTimelineItemClass: string, historicaCardContentClass: string;
		if (isUsingSmartTheme) {
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
		if (!isMobile().any) {
			timelineContainer.addEventListener("contextmenu", async (e) => {
				e.preventDefault()
				new TimelineActionModal(currentPlugin.app,
					timelineContainer, currentPlugin,
					timelineData, isUsingSmartTheme).open()
			})
		}
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
			timelineCard.createEl('div', {
				cls: historicaCardTimeClass,
				text: entry.stringThatParseAsDate
			})
			const timelineCardContent = timelineCardContainer.createEl('div', {
				cls: historicaCardContentClass,

			})

			FormatSentencesWithMarkElement(entry.sentence, timelineCardContent, isUsingSmartTheme)
			timelineCardContent.addEventListener('click', async () => {

				new HistoricaSearchResultModal(currentPlugin.app, entry.stringThatParseAsDate, currentPlugin, isUsingSmartTheme).open()
			})
		})


	}
}


