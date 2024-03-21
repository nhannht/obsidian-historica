import HistoricaPlugin from "../main";


export function FormatSentencesWithMarkElement(sen: string, el: HTMLElement, isUsingSmartTheme: boolean) {
	const regex = /(<historica-mark>.*<\/historica-mark>)/g
	const parts = sen.split(regex)
	const historicaMarkClass = isUsingSmartTheme ? "historica-mark-smart-theme" : "historica-mark"

	// console.log(parts)
	for (let i = 0; i < parts.length; i++) {
		if (regex.test(parts[i])) {
			//@ts-ignore
			el.createEl('historica-mark', {
				cls: historicaMarkClass,
				text: parts[i]
					.replace(/<historica-mark>/g, "")
					.replace(/<\/historica-mark>/g, "")
			})

		} else {
			el.createEl('span', {
				text: parts[i]
			})
		}
	}
}
