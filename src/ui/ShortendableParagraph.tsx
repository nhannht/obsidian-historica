import {useState} from "react";
import {sanitizeHtml, truncate} from "@/src/utils";

export default function ShortendableParagraph(props: {
	content: string,
	className?: string,
	isExpanded: boolean,
}) {
	const [hovered, setHovered] = useState(false);
	const displayText = props.isExpanded ? props.content : truncate(props.content, 150);

	return (
		<div
			className={props.className}
			style={{
				width: "100%", maxWidth: "42rem", borderRadius: 6, boxSizing: "border-box",
				border: `2px solid ${hovered ? "var(--interactive-accent)" : "transparent"}`,
				padding: "24px 24px 0",
				transition: "border-color 0.11s",
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<p className="mb-4 break-words ql-editor" dangerouslySetInnerHTML={{__html: sanitizeHtml(displayText)}}/>
		</div>
	);
}
