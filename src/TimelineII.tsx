import {FormatDate, JumpToSource, PlotUnitNg} from "./global";
import React from "react";
import HistoricaPlugin from "@/main";
import {Content} from "@/src/ui/nhannht/TimelineGeneral"

export function TimelineII(props: {
	units: PlotUnitNg[],
	shitRef?: React.MutableRefObject<HTMLDivElement | null>,
	plugin:HistoricaPlugin
}) {
	return (

		<div ref={props.shitRef}
			 className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[color:--background-modifier-border-hover] before:to-transparent">

			{props.units.map((u, i) => {
				return <div key={i}
							className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
					<div
						className="flex items-center justify-center w-10 h-10 rounded-full border border-[color:--background-modifier-border] bg-[color:--background-primary-alt] group-[.is-active]:bg-[color:--background-secondary-alt] text-[color:--text-accent] group-[.is-active]:text-[color:--text-accent-hover] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
						{/*<Peacock/>*/}
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
							 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
							 className="lucide lucide-book-open">
							<path d="M12 7v14"/>
							<path
								d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
						</svg>
					</div>
					<div
						className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[--background-primary] p-4 rounded border border-[color:--background-modifier-border]] shadow">
						<div className="flex items-center justify-between space-x-2 mb-1">
							<div
								title={"Jump to position"}
								onClick={async ()=>{
									await JumpToSource(u.nodePos,u.filePath,u.sentence,props.plugin)
								}}
								className="hover:cursor-pointer p-1 rounded-lg hover:bg-[color:--background-modifier-hover] font-bold text-[color:--text-normal]]">{u.filePath}</div>
							<time
								className="font-caveat font-medium text-[color:--text-accent]]">{FormatDate(new Date(u.parsedResultUnixTime))}</time>
						</div>
						<Content unit={u} plugin={props.plugin}/>
					</div>

				</div>

			})}

		</div>
	)
}
