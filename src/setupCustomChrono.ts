import * as chrono from "chrono-node";

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
