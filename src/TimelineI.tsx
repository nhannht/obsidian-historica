import {PlotUnitNg} from "./global";
import HistoricaPlugin from "@/main";
import {PlotUnitPlot} from "@/src/ui/nhannht/SinglePlotUnit";

export function TimelineI(props: {
	units: PlotUnitNg[],
	plugin: HistoricaPlugin,
	shitRef?: React.MutableRefObject<HTMLDivElement | null>
	handleRemovePlotUnit: (id: string) => void,
	handleEditPlotUnit: (id: string, updatedUnit: PlotUnitNg) => void
	handleAddPlotUnit: (index: number) => void
}) {

	// useEffect(() => {
	// 	console.log(props.units)
	// }, [props.units]);


	return <div className={"-my-6"} ref={props.shitRef}>
		{props.units.length > 0 && props.units.map((u, index) => {
			return (
				<PlotUnitPlot plugin={props.plugin} handleRemovePlotUnit={props.handleRemovePlotUnit}
							  handleEditPlotUnit={props.handleEditPlotUnit}
							  handleAddPlotUnit={props.handleAddPlotUnit} u={u} index={index}/>
			)
		})}
	</div>
}
