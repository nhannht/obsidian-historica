import {Chrono} from "chrono-node";
import * as chrono from "chrono-node"
import {parseInt} from "lodash";

export const HistoricaSupportLanguages = [
	"en",
	"ja",
	"fr",
	"de",
	"nl",
	"ru",
	"uk",
	"pt",
	"zh.hant",
]

const BCEpattern: RegExp[] = [
	/\b(\d{4})\s+B\.?C\.?E?\.?\b/i,
	/\b(\d{4})\s+Before\s+\w{1,2}\s+Christ\b/i,
	/\b(\d{4})\s+Before\s+\w{1,2}\s+Common\s+Era\b/i,
	/\bB\.?C\.?E?\.?:?\s+(\d{4})\b/i,
	/\bBefore\s+\w{1,2}\s+Christ\s+(\d{4})\b/i,
	/\bBefore\s+\w{1,2}\s+Common\s+Era\s+(\d{4})\b/i,
]

const ADpattern: RegExp[] = [
	/\b(\d{4})\s+A\.?D\.?E?\.?\b/i,
	/\b(\d{4})\s+Anno\s+Domini\b/i,
	/\bA\.?D\.?E?\.?:?\s+(\d{4})\b/i,
	/\bAnno\s+Domini\s+(\d{4})\b/i,
]

export default class HistoricaChrono {


	get customChrono(): Chrono {
		return this._customChrono;
	}

	set customChrono(value: Chrono) {
		this._customChrono = value;
	}


	private _customChrono!: Chrono;


	async setupCustomChrono(userLang: string) {
		if (userLang === "en") {
			this.customChrono = chrono.en.casual.clone()
		} else if (userLang === "de") {
			this.customChrono = chrono.de.casual.clone()

		} else if (userLang === "fr") {
			this.customChrono = chrono.fr.casual.clone()
		} else if (userLang === "ja") {
			this.customChrono = chrono.ja.casual.clone()
		} else if (userLang === "nl") {
			this.customChrono = chrono.nl.casual.clone()
		} else if (userLang === "ru") {
			this.customChrono = chrono.ru.casual.clone()

		} else if (userLang === "uk") {
			this.customChrono = chrono.uk.casual.clone()
		} else if (userLang === "pt") {
			this.customChrono = chrono.pt.casual.clone()
		} else if (userLang === "zh.hant") {
			this.customChrono = chrono.zh.hant.clone()
		}

		if (userLang === "en") {
			// in/at/on... year
			this.customChrono.parsers.push({
				pattern: () => {
					return /\b(in|at|on|from|to|year)\s+(\d{4})\b/i
				},
				extract: (_context, match) => {
					return {
						day: 1, month: 1, year: parseInt(match[2])
					}
				}
			})
			// YYYY/MM/DD
			this.customChrono.parsers.push({
				pattern: () => {
					return /\b(\d{4})[\/,-](\d{1,2})[\/,-](\d{1,2})\b/i
				},
				extract: (_context, match) => {
					return {
						day: parseInt(match[3]), month: parseInt(match[2]), year: parseInt(match[1])
					}
				}
			})
			// MM/DD/YYYY
			this.customChrono.parsers.push({
				pattern: () => {
					return /\b(\d{1,2})[\/,-](\d{1,2})[\/,-](\d{4})\b/i
				},
				extract: (_context, match) => {
					return {
						day: parseInt(match[2]), month: parseInt(match[1]), year: parseInt(match[3])
					}
				}
			})
			// dd/Aug/YYYY
			this.customChrono.parsers.push({
				pattern: () => {
					return /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/i
				},
				extract: (_context, match) => {
					return {
						day: parseInt(match[1]),
						month: new Date(Date.parse(match[2] + " 1, 2000")).getMonth() + 1,
						year: parseInt(match[3])
					}
				}
			})
			// Aug/dd/YYYY
			this.customChrono.parsers.push({
				pattern: () => {
					return /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{4})\b/i
				},
				extract: (_context, match) => {
					return {
						day: parseInt(match[2]),
						month: new Date(Date.parse(match[1] + " 1, 2000")).getMonth() + 1,
						year: parseInt(match[3])
					}
				}
			})
			// YYYY/MM
			this.customChrono.parsers.push({
				pattern: () => {
					return /\b(\d{4})[\/,-](\d{1,2})\b/i
				},
				extract: (_context, match) => {
					return {
						day: 1, month: parseInt(match[2]), year: parseInt(match[1])
					}
				}
			})

			// MM/YYYY
			this.customChrono.parsers.push({
				pattern: () => {
					return /\b(\d{1,2})[\/,-](\d{4})\b/i
				},
				extract: (_context, match) => {
					return {
						day: 1, month: parseInt(match[1]), year: parseInt(match[2])
					}
				}
			})

			//Aug/YYYY
			this.customChrono.parsers.push({
				pattern: () => {
					return /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/i
				},
				extract: (_context, match) => {
					return {
						day: 1,
						month: new Date(Date.parse(match[1] + " 1, 2000")).getMonth() + 1,
						year: parseInt(match[2])
					}
				}
			})
			// this.customChrono.parsers.push({
			// 	pattern:()=> {
			// 		return /\b(\d{4})\b/i
			// 	},
			// 	extract: (_context, match)=>{
			// 		return {
			// 			day: 1,
			// 			month: 1,
			// 			year: parseInt(match[1])
			// 		}
			// 	}
			// })


			BCEpattern.forEach((pattern) => {
				this.customChrono.parsers.push({
					pattern: () => {
						return pattern
					},
					extract: (_context, match) => {
						return {
							year: -parseInt(match[1])
						}
					}
				})
			})
			ADpattern.forEach((pattern) => {
				this.customChrono.parsers.push({
					pattern: () => {
						return pattern
					},
					extract: (_context, match) => {
						return {
							year: parseInt(match[1])
						}
					}
				})
			})
		}


		return this.customChrono
	}


}
