import {FormatDate, JumpToTextInParagraph, PlotUnitNg} from "./global";
import HistoricaPlugin from "@/main";
import {Content} from "@/src/ui/nhannht/TimelineGeneral"
export function TimelineIII(props:{
	units:PlotUnitNg[],
	plugin:HistoricaPlugin,
	shitRef?: React.MutableRefObject<HTMLDivElement | null>,

}) {
	return (
		<div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[8.75rem] md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[color:--background-modifier-border-hover] before:to-transparent">
			{props.units.map((u,i)=> {
				return (
					<div key={i} className="relative">
						<div className="md:flex items-center md:space-x-4 mb-3">
							<div className="flex items-center space-x-4 md:space-x-2 md:space-x-reverse">

								<div
									className="flex items-center justify-center w-10 h-10 rounded-full bg-[color:--background-primary] shadow md:order-1">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
										 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
										 strokeLinejoin="round" className="lucide lucide-book-open">
										<path d="M12 7v14"/>
										<path
											d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
									</svg>
								</div>

								<time
									className="font-caveat font-medium text-xl text-[--text-accent] md:w-28">{FormatDate(new Date(u.parsedResultUnixTime))}
								</time>
							</div>

							<div
								onClick={async ()=>{
									await JumpToTextInParagraph(u.nodePos,u.filePath,u.sentence,props.plugin)
								}}
								title={"jump to position"}
								className="text-[color:--text-accent-hover] ml-14 rounded-lg p-1 hover:cursor-pointer hover:bg-[color:--background-modifier-hover] ">{u.filePath}
							</div>
						</div>
						<Content unit={u} plugin={props.plugin}/>


					</div>
				)
			})}


		</div>
	)
}
