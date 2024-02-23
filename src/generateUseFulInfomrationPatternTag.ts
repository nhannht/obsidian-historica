//@ts-ignore
import {string} from "wink-nlp-utils"

export async function generateUseFulInfomrationPatternTag() {

	const pattern: string[] = [

		"#Noun #Noun #Verb #Verb",
		"#Noun #Verb #Verb",
		"#Noun #Verb",
		"#Adjective #Noun",
		"#Determiner #Adjective #Noun",
		"#Determiner #Noun",

	]
	return pattern

}
