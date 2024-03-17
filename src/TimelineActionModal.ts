import {App, Modal, Notice, Plugin} from "obsidian";
import {convertHTMLToImageData} from "./convertHTMLToImageData";
import {convertImageToPdf} from "./convertImageToPdf";
import {toBlob} from "html-to-image";
import {TimelineEntryChrono} from "./GetTimelineDataFromDocumentArray";
import {json2csv} from 'json-2-csv';

export class TimelineActionModal extends Modal {
    thisPlugin: Plugin
    targetEl: HTMLElement
	timelineData: TimelineEntryChrono[]

	constructor(app: App, targetEl: HTMLElement, thisPlugin: Plugin, timelineData: TimelineEntryChrono[]) {
        super(app)
        this.targetEl = targetEl
        this.thisPlugin = thisPlugin
		this.timelineData = timelineData
    }

    onOpen() {
        super.onOpen();
        const {contentEl} = this
        const actionModalEl = contentEl.createEl('div', {
            cls: "historica-timeline-action-modal"
        })

        actionModalEl.createEl('div', {
            text: "Export as image (clipboard)",
            cls: "historica-timeline-action-button",

        }).addEventListener('click', async () => {
            const blob = await toBlob(this.targetEl)
            if (blob) {
                const item = new ClipboardItem({[blob.type]: blob});
                await navigator.clipboard.write([item])
            }
            new Notice("Successfully copied to clipboard")
            this.close()

        })

        actionModalEl.createEl('div', {
            text: "Export as image (PNG)",
            cls: "historica-timeline-action-button",

        }).addEventListener('click', async () => {
            const image = await convertHTMLToImageData(this.targetEl)
            const link = document.createElement('a');
            link.href = image;
            link.download = 'historica-timeline.png';
            link.click();
            new Notice("Successfully download image")
            this.close()
        })

        actionModalEl.createEl('div', {
            text: "Export as pdf",
            cls: "historica-timeline-action-button"
        }).addEventListener('click', async () => {
            const imageData = await convertHTMLToImageData(this.targetEl)
            const image = new Image()
            image.src = imageData
            const pdf = await convertImageToPdf(imageData)

            pdf.save('historica-timeline.pdf')

            new Notice("Successfully download pdf")
            this.close()

        })

		actionModalEl.createEl('div', {
			text: "Export as json",
			cls: "historica-timeline-action-button"
		}).addEventListener('click', async () => {
			const data = JSON.stringify(this.timelineData, null, 4)
			// console.table(data)
			const blob = new Blob([data], {type: 'application/json'});
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = 'historica-timeline.json';
			link.click();
			URL.revokeObjectURL(url);
			new Notice("Successfully download json")
			this.close()
		})
		actionModalEl.createEl('div', {
			text: "Export as csv",
			cls: "historica-timeline-action-button"
		}).addEventListener('click', async () => {

			const csv = await json2csv(this.timelineData)
			const blob = new Blob([csv], {type: 'text/csv'});
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = 'historica-timeline.csv';
			link.click();
			URL.revokeObjectURL(url);
			new Notice("Successfully download csv")
			this.close()

		})
		actionModalEl.createEl('div', {
			text: "Copy as json",
			cls: "historica-timeline-action-button"
		}).addEventListener('click', async () => {
			const data = JSON.stringify(this.timelineData, null, 4)
			// console.table(data)
			await navigator.clipboard.writeText(data)
			new Notice("Successfully copied to clipboard")
			this.close()
		})
		actionModalEl.createEl('div', {
			text: "Copy as csv",
			cls: "historica-timeline-action-button"
		}).addEventListener('click', async () => {
			const csv = json2csv(this.timelineData)

			await navigator.clipboard.writeText(csv)
			new Notice("Successfully copied to clipboard")
			this.close()
		})


    }


    onClose() {
        super.onClose();
    }
}
