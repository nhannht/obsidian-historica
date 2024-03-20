import {TimelineEntryChrono} from "./GetTimelineDataFromDocumentArray";
import {FormatSentencesWithMarkElement} from "./FormatSentencesWithMarkElement";
import {Plugin, setIcon} from "obsidian";
import {HistoricaSearchResultModal} from "./SearchResultModal";
import {TimelineActionModal} from "./TimelineActionModal";
import isMobile from "ismobilejs";
import {HistoricaSetting} from "./historicaSettingTab";

export async function renderTimelineEntry(currentPlugin: Plugin,
										  timelineData: TimelineEntryChrono[],
										  style: number,
										  el: HTMLElement) {
	const settings: HistoricaSetting = await currentPlugin.loadData()
	const isShowRelativeTime = settings.showRelativeTime

	if (style === 1) {
		const timelineEl = el.createEl('div', {
			cls: "historica-container-1"
		})
		// console.log(isMobile())
		if (!isMobile().any) {
			timelineEl.addEventListener("contextmenu", async (e) => {
				e.preventDefault()
				new TimelineActionModal(currentPlugin.app, timelineEl, currentPlugin, timelineData).open()
			})
		}


		timelineData.map((entry) => {
			const timelineEntryEl = timelineEl.createEl('div', {
				cls: "historica-entry-1 group"
			})
			// timelineEntryEl.createEl('div', {cls: "historica-label", text: entry.importantInformation})
			const verticalLine = timelineEntryEl.createEl('div', {cls: "historica-vertical-line-1"})
			if (isShowRelativeTime) {
				verticalLine.createEl('time', {cls: "historica-time-1", text: entry.stringThatParseAsDate})
			} else {
				verticalLine.createEl('time', {cls: "historica-time-1", text: entry.dateStringCompact})
			}
			verticalLine.createEl('div', {cls: "historica-title-1", text: entry.importantInformation})
			const historicaContent = timelineEntryEl.createEl('div', {cls: "historica-content-1"})
			historicaContent.addEventListener('click', async () => {

				new HistoricaSearchResultModal(currentPlugin.app, entry.stringThatParseAsDate, currentPlugin).open()


			})
			FormatSentencesWithMarkElement(entry.sentence, historicaContent)

		})
	} else if (style === 2) {
		const timelineContainer = el.createEl('div', {
			cls: "historica-container-2"
		})
		if (!isMobile().any) {
			timelineContainer.addEventListener("contextmenu", async (e) => {
				e.preventDefault()
				new TimelineActionModal(currentPlugin.app, timelineContainer, currentPlugin, timelineData).open()
			})
		}
		timelineData.map((entry) => {
			const timelineItem = timelineContainer.createEl('div', {
				cls: "historica-item-2 group"
			})
			const timelineIcon = timelineItem.createEl('div', {
				cls: "historica-icon-2"
			})
			const timelineCardContainer = timelineItem.createEl('div', {
				cls: "historica-card-container-2"
			})

			// @ts-ignore
			// const timelineSvg = timelineIcon.createEl('svg', {
			// 	cls: "historica-svg-2",
			// 	attr: {
			// 		xmlns: "http://www.w3.org/2000/svg",
			// 		width: "10",
			// 		height: "10",
			// 	}
			//
			// })
			setIcon(timelineIcon, "shell")

			// @ts-ignore
			// const timelineInnerIcon = timelineIcon.createEl('div', {
			// 	cls: "historica-inner-icon-2",
			// })

			const timelineCard = timelineCardContainer.createEl('div', {
				cls: "historica-card-2"

			})
			timelineCard.createEl('div', {
				cls: "historica-card-title-2",
				text: entry.importantInformation
			})
			if (isShowRelativeTime) {
				timelineCard.createEl('div', {
					cls: "historica-card-time-2",
					text: entry.stringThatParseAsDate
				})
			} else {
				timelineCard.createEl('div', {
					cls: "historica-card-time-2",
					text: entry.dateStringCompact
				})

			}
			const timelineCardContent = timelineCardContainer.createEl('div', {
				cls: "historica-card-content-2",

			})

			FormatSentencesWithMarkElement(entry.sentence, timelineCardContent)
			timelineCardContent.addEventListener('click', async () => {

				new HistoricaSearchResultModal(currentPlugin.app, entry.stringThatParseAsDate, currentPlugin).open()


			})


		})

	}
}


