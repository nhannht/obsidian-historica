import * as chrono from "chrono-node";
import {ReferenceWithTimezone} from "chrono-node";

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

export async function setupCustomChrono() {
	const customChrono = chrono.casual.clone()
	// in/at/on... year
	customChrono.parsers.push({
		pattern: () => {
			return /\b(in|at|on|from|to|year)\s+(\d{4})\b/i
		},
		extract: (context, match) => {
			return {
				day: 1, month: 1, year: parseInt(match[2])
			}
		}
	})
	// YYYY/MM/DD
	customChrono.parsers.push({
		pattern: () => {
			return /\b(\d{4})[\/,-](\d{1,2})[\/,-](\d{1,2})\b/i
		},
		extract: (context, match) => {
			return {
				day: parseInt(match[3]), month: parseInt(match[2]), year: parseInt(match[1])
			}
		}
	})
	// MM/DD/YYYY
	customChrono.parsers.push({
		pattern: () => {
			return /\b(\d{1,2})[\/,-](\d{1,2})[\/,-](\d{4})\b/i
		},
		extract: (context, match) => {
			return {
				day: parseInt(match[2]), month: parseInt(match[1]), year: parseInt(match[3])
			}
		}
	})
	// dd/Aug/YYYY
	customChrono.parsers.push({
		pattern: () => {
			return /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/i
		},
		extract: (context, match) => {
			return {
				day: parseInt(match[1]),
				month: new Date(Date.parse(match[2] + " 1, 2000")).getMonth() + 1,
				year: parseInt(match[3])
			}
		}
	})
	// Aug/dd/YYYY
	customChrono.parsers.push({
		pattern: () => {
			return /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{4})\b/i
		},
		extract: (context, match) => {
			return {
				day: parseInt(match[2]),
				month: new Date(Date.parse(match[1] + " 1, 2000")).getMonth() + 1,
				year: parseInt(match[3])
			}
		}
	})
	// YYYY/MM
	customChrono.parsers.push({
		pattern: () => {
			return /\b(\d{4})[\/,-](\d{1,2})\b/i
		},
		extract: (context, match) => {
			return {
				day: 1, month: parseInt(match[2]), year: parseInt(match[1])
			}
		}
	})

	// MM/YYYY
	customChrono.parsers.push({
		pattern: () => {
			return /\b(\d{1,2})[\/,-](\d{4})\b/i
		},
		extract: (context, match) => {
			return {
				day: 1, month: parseInt(match[1]), year: parseInt(match[2])
			}
		}
	})

	//Aug/YYYY
	customChrono.parsers.push({
		pattern: () => {
			return /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/i
		},
		extract: (context, match) => {
			return {
				day: 1,
				month: new Date(Date.parse(match[1] + " 1, 2000")).getMonth() + 1,
				year: parseInt(match[2])
			}
		}
	})


	// customChrono.parsers.push({
	// 	pattern:()=>{
	// 		return /\b(from)\s+(\d{4})\s+(to)\s+(\d{4})\b/i
	// 	},
	// 	extract:(context, match)=>{
	// 		const refDate = new Date()
	// 		const reference = new ReferenceWithTimezone(refDate, 0)
	// 		return {
	// 			start:{
	// 				year:parseInt(match[2])
	// 			},
	// 			end:{
	// 				year:parseInt(match[4])
	// 			},
	// 			refDate: refDate,
	// 			reference: reference,
	// 			index: match.index,
	// 			text: match[0],
	// 			clone: (context: any, refDate: { getUTCFullYear: () => any; }, reference: any) => {
	// 				return {
	// 					year: refDate.getUTCFullYear()
	// 				}
	// 			},
	// 			knownValues: {
	// 				day:1,
	// 				month:1,
	// 				year: refDate.getUTCFullYear()
	// 			},
	// 			date: refDate,
	// 			tags: { year: true }
	//
	//
	//
	//
	// 		}
	// 	}
	// })


	BCEpattern.forEach((pattern) => {
		customChrono.parsers.push({
			pattern: () => {
				return pattern
			},
			extract: (context, match) => {
				return {
					year: -parseInt(match[1])
				}
			}
		})
	})
	ADpattern.forEach((pattern) => {
		customChrono.parsers.push({
			pattern: () => {
				return pattern
			},
			extract: (context, match) => {
				return {
					year: parseInt(match[1])
				}
			}
		})
	})


	return customChrono
}
