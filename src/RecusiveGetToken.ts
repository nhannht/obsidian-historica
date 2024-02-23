import {Token} from "marked";

export function RecusiveGetToken(document: Token, tokens: any[]) {
	if ("type" in document && document.type === "text") {
		tokens.push(document)
	}
	if ("tokens" in document && document.tokens) {

		document.tokens.map((t) => {
			RecusiveGetToken(t, tokens)
		})
		// table
	}
	if ("rows" in document && document.rows) {
		document.rows.map((row: any[]) => {
			row.map((cell) => {
				RecusiveGetToken(cell, tokens)
			})
		})
	}
	if ("header" in document && document.header) {


		document.header.map((header: any[]) => {
			// @ts-ignore
			RecusiveGetToken(header, tokens)
		})
	}
	// for list
	if ("items" in document && document.items) {
		document.items.map((item: any) => {
			RecusiveGetToken(item, tokens)
		})
	}

	// filter only document which is the most module

}
