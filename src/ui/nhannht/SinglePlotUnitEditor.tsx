
import {useEffect, useState} from "react"
import {Input} from "@/src/ui/shadcn/Input"
import {PlotUnitNg, QuillFormat, QuillModules, TimeData} from "../../global";
import {moment} from "obsidian";
import ReactQuill from "react-quill";
import {RadioGroup,RadioGroupItem} from "@/src/ui/shadcn/RadioGroup"
import {Label} from "@/src/ui/shadcn/Label"


export default function SinglePlotUnitNgEditor(props: {
	u: PlotUnitNg,
	handleEditPlotUnit: (id: string, u: PlotUnitNg) => void,
	handleModeChange: (mode: string) => void
}) {
	const [plotUnit, setPlotUnit] = useState<PlotUnitNg>(structuredClone(props.u))

	// useEffect(() => {
	// 	console.log(plotUnit)
	// }, [plotUnit]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const {name, value} = e.target
		setPlotUnit((prev) => ({...prev, [name]: value}))
	}

	// const handleNodePosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	const { name, value } = e.target
	// 	// const [position, coordinate] = name.split(".")
	//
	// }
	const [date, setDate] = useState(()=>{
		if (props.u.time.style === "unix"){
			return {
				year: moment.unix(Number(props.u.time.value) / 1000).year(),
				month: moment.unix(Number(props.u.time.value) / 1000).month() + 1,
				day: moment.unix(Number(props.u.time.value) / 1000).date(),
			}

		} else {
			return {
				year: 0,
				month: 0,
				day: 0
			}
		}

	} )

	const [freeForm,setFreeForm] = useState(()=>{
		if (props.u.time.style === "free") return props.u.time.value
		else return ""
	})

	useEffect(() => {

		if (plotUnit.time.style === "unix"){
		const dateString = `${date.year}-${date.month}-${date.day}`;
		const parsedDate = moment(dateString);
		// console.log(parsedDate.toDate())
		const unixTime = parsedDate.unix();
		const newTime:TimeData = {style:"unix",value:unixTime.toString()}
		setPlotUnit((prev) => ({...prev, time: newTime }))

		} else {
			const newTime:TimeData = {style:"free",value:freeForm}
			setPlotUnit({...plotUnit,time:newTime})
		}
		// console.log(date)
		// console.log(props.u.parsedResultUnixTime)

	}, [date,freeForm])


	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value} = e.target
		setDate((prev) => ({...prev, [name]: parseInt(value)}))
	}




	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		props.handleEditPlotUnit(plotUnit.id, plotUnit)
		props.handleModeChange("normal")
		// Here you would typically send the data to your backend or perform other actions
	}

	const [timeMode,setTimeMode] = useState<"unix"|"free">("unix")
	useEffect(() => {
		setPlotUnit((prev)=> ({...prev, time: {...prev.time, style: timeMode}}))

	}, [timeMode]);



	const timeCustom = ()=>{
		if (timeMode === "unix"){
			return (
				<div>
					<label className="block text-sm font-medium text-gray-700">Date</label>
					<div className="grid grid-cols-3 gap-2">
						<Input
							name="year"
							type="tel"
							placeholder="Year"
							value={date.year}
							onChange={handleDateChange}
						/>
						<Input
							name="month"
							type="number"
							placeholder="Month"
							value={date.month}
							onChange={handleDateChange}
							min={1}
							max={12}
							maxLength={2}

						/>
						<Input
							name="day"
							type="number"
							placeholder="Day"
							value={date.day}
							onChange={handleDateChange}
							min={1}
							max={31}
							maxLength={2}

						/>
					</div>
					<div className="mt-2 text-sm text-gray-600">
						Unix Time: {plotUnit.time.value}
					</div>
				</div>
			)
		} else {
			return (
				<Input
					onChange={e => setFreeForm(e.target.value)}
					placeholder={"any text...."}></Input>
			)
		}
	}


	return (
		<div className="p-4 max-w-2xl mx-auto">
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700">ID: {plotUnit.id}</label>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">Title</label>
					<Input name="parsedResultText" value={plotUnit.parsedResultText} onChange={handleChange}/>
				</div>

				<div>
					<label>Content</label>
					<ReactQuill formats={QuillFormat} modules={QuillModules} theme="snow" value={plotUnit.sentence}
								onChange={(value) => {

									setPlotUnit((prev) => ({...prev, sentence: value}))
								}}/>
				</div>
				<div>
					<label>Time mode</label>
					<RadioGroup defaultValue={timeMode}  onValueChange={(v) => setTimeMode(v as "unix" | "free")}>
						<div className={"flex items-center space-x-2"}>
							<RadioGroupItem id={"unix"}  value={"unix"}/>
							<Label htmlFor={"unix"}>Normal</Label>
						</div>
						<div className={"flex items-center space-x-2"}>
							<RadioGroupItem id={"free"} value={"free"}/>
							<Label htmlFor={"free"}>Free</Label>
						</div>
					</RadioGroup>
				</div>
				{timeCustom()}





				<div className={"flex justify-center"}>
					<button className={"w-1/2"}

						type="submit">Back</button>
				</div>
			</form>
		</div>
	)
}
