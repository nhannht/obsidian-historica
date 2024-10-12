import {jsPDF} from "jspdf";
import {toPng} from "html-to-image";

export default class HistoricaExportHelper {

	async convertHTMLToImageData(el: HTMLElement) {
		const image = await toPng(el)
		return image
	}

	async convertImageToPdf(imageData: string) {
		const image = new Image()
		image.src = imageData

		await new Promise<void>((resolve) => {
			image.onload = () => resolve();
		});

		const width = image.naturalWidth
		const height = image.naturalHeight
		console.log(`${width} - ${height}`)
		const pdf = new jsPDF();
		pdf.addImage(imageData,
			'PNG',
			0,
			0,
			width,
			height);


		return pdf
	}
}
