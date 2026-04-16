import { Card, CardContent } from "@/src/ui/shadcn/Card"
import {cn} from "@/src/lib/utils";
import {sanitizeHtml, truncate} from "@/src/utils";

export default function ShortendableParagraph(props: {
	content: string,
	className?: string,
	isExpanded: boolean,
}) {
	const displayText = props.isExpanded ? props.content : truncate(props.content, 150)

	return (
		<Card className={cn("w-full max-w-2xl hover:border-[--interactive-accent] border-0 hover:border-2",props.className)}>
			<CardContent className="pt-6 ">
				<p  className="mb-4 break-words ql-editor" dangerouslySetInnerHTML={{__html: sanitizeHtml(displayText)}}/>

			</CardContent>
		</Card>
	)
}
