import {FormatDate, PlotUnit} from "./global";
import ShortendableParagraph from "@/src/ShortendableParagraph";

export function TimelineI(props:{
	units: PlotUnit[]
}) {


	return <div className={"-my-6"}>
		{props.units.map((u,i)=>{
			return (
				 // <!-- Timeline Item -->
				<div key={i} className="relative pl-8 sm:pl-32 py-6 group">
					{/*// <!-- Purple label -->*/}
					<div className="font-caveat font-medium text-2xl text-[color:--text-accent] mb-1 sm:mb-0">{u.parsedResult.text}</div>
					{/*// <!-- Vertical line (::before) ~ Date ~ Title ~ Circle marker (::after) -->*/}
					<div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:px-px before:bg-[--background-modifier-hover] sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-2 after:h-2 after:bg-[--background-modifier-hover] after:border-4 after:box-content after:border-[--background-modifier-hover] after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5">
						<time className="sm:absolute left-0 translate-y-0.5 inline-flex items-center justify-center text-xs font-semibold uppercase w-20 h-6 mb-3 sm:mb-0 text-[color:--text-accent] bg-[--background-primary-alt] border rounded-full">{FormatDate(u.parsedResult.date())}</time>
						{/*<div className="text-xl font-bold text-slate-900">Acme was founded in Milan, Italy</div>*/}
					</div>
					{/*// <!-- Content -->*/}
					<ShortendableParagraph className="text-[color:--text-normal]" content={u.text.replace(u.parsedResult.text, `<historica-mark class="text-[color:--text-accent-hover]">${u.parsedResult.text}</historica-mark>`)}/>
				</div>
			)
		})}
	</div>
}
