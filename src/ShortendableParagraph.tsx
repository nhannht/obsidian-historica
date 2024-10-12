import { useState } from "react"
import { Button } from "@/src/ui/shadcn/Button"
import { Card, CardContent } from "@/src/ui/shadcn/Card"
import {cn} from "@/lib/utils";

export default function ShortendableParagraph(props:{
	content:string,
	className?:string
}) {
	const [isExpanded, setIsExpanded] = useState(false)
	const [fullText] = useState(props.content)
	const [truncatedText] = useState(fullText.slice(0,150) + "...")

	return (
		<Card className={cn("w-full max-w-2xl border-none",props.className)}>
			<CardContent className="pt-6 ">
				<p className="mb-4 break-words" dangerouslySetInnerHTML={{__html: isExpanded ? fullText : truncatedText}}/>
				<Button
					variant="outline"
					onClick={() => setIsExpanded(!isExpanded)}
					aria-expanded={isExpanded}
					aria-controls="expandable-paragraph"
				>
					{isExpanded ? "Show Less" : "Read More"}
				</Button>
			</CardContent>
		</Card>
	)
}
