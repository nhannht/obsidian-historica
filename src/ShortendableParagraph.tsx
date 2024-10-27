import { useState } from "react"
import { Card, CardContent } from "@/src/ui/shadcn/Card"
import {cn} from "@/lib/utils";

export default function ShortendableParagraph(props: {
	content: string,
	className?: string,
	isExpanded: boolean,
}) {
	const [fullText] = useState(props.content)
	const [truncatedText] = useState(fullText.slice(0,150) + "...")

	return (
		<Card className={cn("w-full max-w-2xl hover:border-[--interactive-accent] border-0 hover:border-2",props.className)}>
			<CardContent className="pt-6 ">
				<p  className="mb-4 break-words ql-editor" dangerouslySetInnerHTML={{__html: props.isExpanded ? fullText : truncatedText}}/>

			</CardContent>
		</Card>
	)
}
