import {sanitizeHtml} from "@/src/utils";
import {SinglePlotUnit} from "@/src/ui/SinglePlotUnit";
import React from "react";
import {useTimelineStore} from "@/src/ui/TimelineContext";

export function TimelineI(props: {
	isDisplayHeader: boolean;
	isDisplayFooter: boolean;
	timelineRef?: React.MutableRefObject<HTMLDivElement | null>,
}) {
	const settings = useTimelineStore(s => s.settings);
	const units = useTimelineStore(s => s.units);
	const showHidden = useTimelineStore(s => s.showHidden);

	const isSingleFile = new Set(units.map(u => u.filePath)).size <= 1
	const visibleUnits = showHidden
		? units
		: units.filter(u => !u.isHidden)

	return <div ref={props.timelineRef}>
		{settings.header
			&& settings.header.trim() !== ""
			&& props.isDisplayHeader
			&& <div className={"ql-editor"} dangerouslySetInnerHTML={{__html:sanitizeHtml(settings.header)}}
			/>}
		{visibleUnits.length > 0 && visibleUnits.map((u, index) => {
			return (
				<SinglePlotUnit unit={u} index={index}
								isSingleFile={isSingleFile}
				/>
			)
		})}

		{settings.footer
			&& settings.footer.trim() !== ""
			&& props.isDisplayFooter
			&& <div className={"ql-editor"} dangerouslySetInnerHTML={{__html:sanitizeHtml(settings.footer)}}/>}
	</div>
}
