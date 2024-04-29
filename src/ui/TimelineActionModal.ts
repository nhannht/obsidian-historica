import {App, Modal, Notice} from "obsidian";
import {toBlob} from "html-to-image";
import {TimelineEntryChrono} from "../backgroundLogic/HistoricaDocumentProcesser";
import {json2csv} from 'json-2-csv';
import HistoricaPlugin from "../../main";

export class TimelineActionModal extends Modal {
	thisPlugin: HistoricaPlugin
    targetEl: HTMLElement
	timelineData: TimelineEntryChrono[]
	isUsingSmartTheme: boolean

	constructor(app: App, targetEl: HTMLElement,
				thisPlugin: HistoricaPlugin,
				timelineData: TimelineEntryChrono[],
				isUsingSMartTheme: boolean
	) {
        super(app)
        this.targetEl = targetEl
        this.thisPlugin = thisPlugin
		this.timelineData = timelineData
		this.isUsingSmartTheme = isUsingSMartTheme

    }

	override onOpen() {
        super.onOpen();
        const {contentEl} = this
		const historicaTimelineActionModalClass = this.isUsingSmartTheme ? "historica-timeline-action-modal-smart-theme" : "historica-timeline-action-modal"
        const actionModalEl = contentEl.createEl('div', {
			cls: historicaTimelineActionModalClass
        })
		// const setting = this.thisPlugin.settingManager.settings

		const actionButtonClass = this.isUsingSmartTheme ? "historica-timeline-action-button-smart-theme" : "historica-timeline-action-button"

        actionModalEl.createEl('div', {
            text: "Export as image (clipboard)",
			cls: actionButtonClass,

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
			cls: actionButtonClass,

        }).addEventListener('click', async () => {
            const image = await this.thisPlugin.historicaExportHelper.convertHTMLToImageData(this.targetEl)
            const link = document.createElement('a');
            link.href = image;
            link.download = 'historica-timeline.png';
            link.click();
            new Notice("Successfully download image")
            this.close()
        })

        actionModalEl.createEl('div', {
            text: "Export as pdf",
			cls: actionButtonClass
        }).addEventListener('click', async () => {
            const imageData = await this.thisPlugin.historicaExportHelper.convertHTMLToImageData(this.targetEl)
            const image = new Image()
            image.src = imageData
            const pdf = await this.thisPlugin.historicaExportHelper.convertImageToPdf(imageData)

            pdf.save('historica-timeline.pdf')

            new Notice("Successfully download pdf")
            this.close()

        })

		actionModalEl.createEl('div', {
			text: "Export as json",
			cls: actionButtonClass
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
			cls: actionButtonClass
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
			cls: actionButtonClass
		}).addEventListener('click', async () => {
			const data = JSON.stringify(this.timelineData, null, 4)
			// console.table(data)
			await navigator.clipboard.writeText(data)
			new Notice("Successfully copied to clipboard")
			this.close()
		})
		actionModalEl.createEl('div', {
			text: "Copy as csv",
			cls: actionButtonClass
		}).addEventListener('click', async () => {
			const csv = json2csv(this.timelineData)

			await navigator.clipboard.writeText(csv)
			new Notice("Successfully copied to clipboard")
			this.close()
		})


    }


	override onClose() {
        super.onClose();
    }
}
