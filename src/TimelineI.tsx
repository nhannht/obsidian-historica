import {PlotUnitNg} from "./global";
import HistoricaPlugin from "@/main";
import {SinglePlotUnit} from "@/src/ui/nhannht/SinglePlotUnit";
import React from "react";

export function TimelineI(props: {
	units: PlotUnitNg[],
	plugin: HistoricaPlugin,
	shitRef?: React.MutableRefObject<HTMLDivElement | null>,
	handleRemovePlotUnit: (id: string) => void,
	handleEditPlotUnit: (id: string, updatedUnit: PlotUnitNg) => void,
	handleAddPlotUnit: (index: number) => void,
	handleMove: (index: number, direction: string) => void,
	handleExpandSingle: (id: string, isExpanded: boolean) => void
}) {

	// useEffect(() => {
	// 	console.log(props.units)
	// }, [props.units]);


	return <div className={"-my-6"} ref={props.shitRef}>
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
	</div>
}
