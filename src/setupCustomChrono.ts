import * as chrono from "chrono-node";

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
	return customChrono
}
