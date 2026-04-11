import {useEffect, useState} from "react"
import {Input} from "@/src/ui/shadcn/Input"
import {TimelineEntry, TimeData} from "@/src/types";
import {moment} from "@/src/moment-fix";
import {RadioGroup, RadioGroupItem} from "@/src/ui/shadcn/RadioGroup"
import {Label} from "@/src/ui/shadcn/Label"

export default function SinglePlotUnitNgEditor(props: {
	unit: TimelineEntry,
	handleEditUnit: (id: string, unit: TimelineEntry) => void,
	handleModeChange: (mode: "normal" | "edit") => void
}) {
	const [plotUnit, setPlotUnit] = useState<TimelineEntry>(structuredClone(props.unit))

	const [timeMode, setTimeMode] = useState<"unix" | "free">(() =>
		props.unit.time.style === "free" ? "free" : "unix"
	)

	const [dateString, setDateString] = useState(() => {
		if (props.unit.time.style === "unix") {
			return moment.unix(Number(props.unit.time.value) / 1000).format("YYYY-MM-DD")
		}
		return ""
	})

	const [freeForm, setFreeForm] = useState(() =>
		props.unit.time.style === "free" ? props.unit.time.value : ""
	)

	useEffect(() => {
		let newTime: TimeData
		if (timeMode === "unix") {
			newTime = {style: "unix", value: moment(dateString).unix().toString()}
		} else {
			newTime = {style: "free", value: freeForm}
		}
		setPlotUnit(prev => ({...prev, time: newTime}))
	}, [dateString, freeForm, timeMode])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const {name, value} = e.target
		setPlotUnit(prev => ({...prev, [name]: value}))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		props.handleEditUnit(plotUnit.id, plotUnit)
		props.handleModeChange("normal")
	}

	return (
		<div className="p-4 max-w-2xl mx-auto">
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-[color:--text-muted]">Title</label>
					<Input name="parsedResultText" value={plotUnit.parsedResultText} onChange={handleChange}/>
				</div>

				<div>
					<label className="block text-sm font-medium text-[color:--text-muted]">Content</label>
					<textarea
						name="sentence"
						className="w-full min-h-[80px] px-3 py-2 text-sm rounded border border-[--background-modifier-border] bg-[--background-primary] text-[color:--text-normal] resize-y focus:outline-none focus:border-[--interactive-accent]"
						value={plotUnit.sentence}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-[color:--text-muted]">Time mode</label>
					<RadioGroup defaultValue={timeMode} onValueChange={(v) => setTimeMode(v as "unix" | "free")}>
						<div className="flex items-center space-x-2">
							<RadioGroupItem id="unix" value="unix"/>
							<Label htmlFor="unix">Specific date</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem id="free" value="free"/>
							<Label htmlFor="free">Custom text</Label>
						</div>
					</RadioGroup>
				</div>

				{timeMode === "unix" ? (
					<div>
						<label className="block text-sm font-medium text-[color:--text-muted]">Date</label>
						<input
							type="date"
							className="px-3 py-1.5 text-sm rounded border border-[--background-modifier-border] bg-[--background-primary] text-[color:--text-normal] focus:outline-none focus:border-[--interactive-accent]"
							value={dateString}
							onChange={e => setDateString(e.target.value)}
						/>
					</div>
				) : (
					<div>
						<label className="block text-sm font-medium text-[color:--text-muted]">Date text</label>
						<Input
							value={freeForm}
							onChange={e => setFreeForm(e.target.value)}
							placeholder="e.g. Spring 480 BCE, Early Renaissance..."
						/>
					</div>
				)}

				<div className="flex justify-center">
					<button
						className="w-1/2 px-4 py-2 rounded text-sm font-medium cursor-pointer bg-[--interactive-accent] text-[--text-on-accent] hover:opacity-90"
						type="submit"
					>Done</button>
				</div>
			</form>
		</div>
	)
}
