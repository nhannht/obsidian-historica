import {toPng} from "html-to-image";

export async function convertHTMLToImageData(el: HTMLElement) {
    const image = await toPng(el)
    return image
}