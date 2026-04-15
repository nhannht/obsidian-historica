import {sanitizeHtml} from "@/src/utils";
import React from "react";
import {useTimelineStore} from "@/src/ui/TimelineContext";
import {TimelineSpine} from "@/src/ui/TimelineSpine";

export function TimelineI(props: {
	isDisplayHeader: boolean;
	isDisplayFooter: boolean;
	timelineRef?: React.MutableRefObject<HTMLDivElement | null>,
}) {
	const settings = useTimelineStore(s => s.settings);
	const units = useTimelineStore(s => s.units);

	const isSingleFile = new Set(units.map(u => u.filePath)).size <= 1

	return <div ref={props.timelineRef}>
		{settings.header
			&& settings.header.trim() !== ""
			&& props.isDisplayHeader
			&& <div className={"ql-editor"} dangerouslySetInnerHTML={{__html:sanitizeHtml(settings.header)}}
			/>}
		<TimelineSpine isSingleFile={isSingleFile}/>
		{settings.footer
			&& settings.footer.trim() !== ""
			&& props.isDisplayFooter
			&& <div className={"ql-editor"} dangerouslySetInnerHTML={{__html:sanitizeHtml(settings.footer)}}/>}
	</div>
}
