import {HistoricaSettingNg, PlotUnitNg} from "@/src/types";
import {sanitizeHtml} from "@/src/utils";
import HistoricaPlugin from "@/main";
import {SinglePlotUnit} from "@/src/ui/SinglePlotUnit";
import React from "react";

export function TimelineI(props: {
	isDisplayHeader: boolean;
	isDisplayFooter: boolean;
	settings:HistoricaSettingNg,
	units: PlotUnitNg[],
	plugin: HistoricaPlugin,
	timelineRef?: React.MutableRefObject<HTMLDivElement | null>,
	handleRemovePlotUnit: (id: string) => void,
	handleEditPlotUnit: (id: string, updatedUnit: PlotUnitNg) => void,
	handleAddPlotUnit: (index: number) => void,
	handleMove: (index: number, direction: string) => void,
	handleExpandSingle: (id: string, isExpanded: boolean) => void

}) {

	return <div ref={props.timelineRef}>
		{props.settings.header
			&& props.settings.header.trim() !== ""
			&& props.isDisplayHeader
			&& <div className={"ql-editor"} dangerouslySetInnerHTML={{__html:sanitizeHtml(props.settings.header)}}
			/>}
		{props.units.length > 0 && props.units.map((u, index) => {
			return (
				<SinglePlotUnit plugin={props.plugin} handleRemovePlotUnit={props.handleRemovePlotUnit}
								handleEditPlotUnit={props.handleEditPlotUnit}
								handleAddPlotUnit={props.handleAddPlotUnit} u={u} index={index}
								handleMove={props.handleMove}
								handleExpandSingle={props.handleExpandSingle}

				/>
			)
		})}

		{props.settings.footer
			&& props.settings.footer.trim() !== ""
			&& props.isDisplayFooter
			&& <div className={"ql-editor"} dangerouslySetInnerHTML={{__html:sanitizeHtml(props.settings.footer)}}/>}
	</div>
}
