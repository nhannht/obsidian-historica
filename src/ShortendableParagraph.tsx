import { useState } from "react"
import { Badge } from "@/src/ui/shadcn/Badge"
import { Card, CardContent } from "@/src/ui/shadcn/Card"
import {cn} from "@/lib/utils";

export default function ShortendableParagraph(props: {
	content: string,
	className?: string,
	isExpanded: boolean,
	setIsExpanded: (b:boolean)=>void
}) {
	const [fullText] = useState(props.content)
	const [truncatedText] = useState(fullText.slice(0,150) + "...")

	return (
		<Card className={cn("w-full max-w-2xl border-none",props.className)}>
			<CardContent className="pt-6 ">
				<p className="mb-4 break-words" dangerouslySetInnerHTML={{__html: props.isExpanded ? fullText : truncatedText}}/>

			</CardContent>
		</Card>
	)
}
