import {jsPDF} from "jspdf";

export async function convertImageToPdf(imageData: string) {
    const image = new Image()
    image.src = imageData
    const width = image.naturalWidth
    const height = image.naturalHeight
    const pdf = new jsPDF();
    pdf.addImage(imageData,
        'PNG',
        0,
        0,
        width,
        height);


    return pdf
}