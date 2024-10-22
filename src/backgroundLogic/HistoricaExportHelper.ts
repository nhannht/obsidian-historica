import {toPng} from "html-to-image";

export default class HistoricaExportHelper {

	async convertHTMLToImageData(el: HTMLElement) {
		const image = await toPng(el)
		return image
	}

}
