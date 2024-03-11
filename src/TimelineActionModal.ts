import {App, Modal, Notice, Plugin} from "obsidian";
import {convertHTMLToImageData} from "./convertHTMLToImageData";
import {convertImageToPdf} from "./convertImageToPdf";
import {toBlob} from "html-to-image";


export class TimelineActionModal extends Modal {
    thisPlugin: Plugin
    targetEl: HTMLElement

    constructor(app: App, targetEl: HTMLElement, thisPlugin: Plugin) {
        super(app)
        this.targetEl = targetEl
        this.thisPlugin = thisPlugin
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


    }


    onClose() {
        super.onClose();
    }
}