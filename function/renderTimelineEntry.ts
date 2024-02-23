import {TimelineEntryChrono} from "./GetTimelineDataFromDocumentArray";
import {FormatSentencesWithMarkElement} from "./FormatSentencesWithMarkElement";

export async function renderTimelineEntry(timelineData: TimelineEntryChrono[],
										  style: number,
										  el: HTMLElement) {
	if (style === 1) {
		const timelineEl = el.createEl('div', {
			cls: "historica-container-1"
		})
		timelineData.map((entry) => {
			const timelineEntryEl = timelineEl.createEl('div', {
				cls: "historica-entry-1 group"
			})
			// timelineEntryEl.createEl('div', {cls: "historica-label", text: entry.importantInformation})
			const verticalLine = timelineEntryEl.createEl('div', {cls: "historica-vertical-line-1"})
			verticalLine.createEl('time', {cls: "historica-time-1", text: entry.dateString})
			verticalLine.createEl('div', {cls: "historica-title-1", text: entry.importantInformation})
			FormatSentencesWithMarkElement(entry.sentence, timelineEntryEl.createEl('div',
				{cls: "historica-content-1"}))

		})
	} else if (style === 2) {
		const timelineContainer = el.createEl('div', {
			cls: "historica-container-2"
		})
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
			const timelineSvg = timelineIcon.createEl('svg', {
				cls: "historica-svg-2",
				attr: {
					xmlns: "http://www.w3.org/2000/svg",
					width: "10",
					height: "10",
				}

			})
			// @ts-ignore
			timelineSvg.createEl('path', {
				attr: {
					"fill-rule": "nonzero",
					d: "M10.422 1.257 4.655 7.025 2.553 4.923A.916.916 0 0 0 1.257 6.22l2.75 2.75a.916.916 0 0 0 1.296 0l6.415-6.416a.916.916 0 0 0-1.296-1.296Z",

				}
			})


			// @ts-ignore
			// const timelineInnerIcon = timelineIcon.createEl('div', {
			// 	cls: "historica-inner-icon-2",
			// })

			const timelineCard = timelineCardContainer.createEl('div', {
				cls: "historica-card-2"

			})
			const timelineCardTitle = timelineCard.createEl('div',{
				cls: "historica-card-title-2",
				text: entry.importantInformation
			})
			const timelineCardTime = timelineCard.createEl('div', {
				cls: "historica-card-time-2",
				text: entry.dateString
			})
			const timelineCardContent = timelineCardContainer.createEl('div', {
				cls: "historica-card-content-2",

			})
			FormatSentencesWithMarkElement(entry.sentence, timelineCardContent)


		})

	}
}


