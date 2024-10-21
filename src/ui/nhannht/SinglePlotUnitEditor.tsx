"use client"

import {useEffect, useState} from "react"
import {Input} from "@/src/ui/shadcn/Input"
import {Button} from "@/src/ui/shadcn/Button"
import {PlotUnitNg, QuillFormat, QuillModules} from "../../global";
import {moment} from "obsidian";
import ReactQuill from "react-quill";

export default function SinglePlotUnitNgEditor(props: {
	u: PlotUnitNg,
	handleEditPlotUnit: (id: string, u: PlotUnitNg) => void,
	handleModeChange: (mode:string) => void
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
	const [date, setDate] = useState({
		year: moment.unix(props.u.parsedResultUnixTime/1000).year(),
		month: moment.unix(props.u.parsedResultUnixTime/1000).month() + 1,
		day: moment.unix(props.u.parsedResultUnixTime/1000).date(),
	})

	useEffect(() => {
		const dateString = `${date.year}-${date.month}-${date.day}`;
		// console.log(props.u.parsedResultUnixTime)
		const parsedDate = moment(dateString, 'YYYY-M-D');
		const unixTime = parsedDate.unix();
		setPlotUnit((prev) => ({ ...prev, parsedResultUnixTime: unixTime * 1000 }))
	}, [date])



	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setDate((prev) => ({ ...prev, [name]: parseInt(value) }))
	}



	// const handleAttachmentChange = (value: string[]) => {
	// 	const selectedAttachments = attachmentOptions.filter((att) => value.includes(att.id))
	// 	setPlotUnit((prev) => ({
	// 		...prev,
	// 		attachments: selectedAttachments,
	// 	}))
	// }

	// const handleFilePathChange = (value: string) => {
	// 	setPlotUnit((prev) => ({
	// 		...prev,
	// 		filePath: value,
	// 	}))
	// }

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		props.handleEditPlotUnit(plotUnit.id, plotUnit)
		props.handleModeChange("normal")
		// Here you would typically send the data to your backend or perform other actions
	}

	return (
		<div className="p-4 max-w-2xl mx-auto">
			<h2 className="text-2xl font-bold mb-4">Edit PlotUnitNg</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700">ID: {plotUnit.id}</label>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">Node Position</label>
					{/*<div className="grid grid-cols-2 gap-2">*/}
					{/*	<Input*/}
					{/*		name="start.line"*/}
					{/*		type="number"*/}
					{/*		placeholder="Start Line"*/}
					{/*		value={plotUnit.nodePos?.start.line || ""}*/}
					{/*		onChange={handleNodePosChange}*/}
					{/*	/>*/}
					{/*	<Input*/}
					{/*		name="start.column"*/}
					{/*		type="number"*/}
					{/*		placeholder="Start Column"*/}
					{/*		value={plotUnit.nodePos?.start.column || ""}*/}
					{/*		onChange={handleNodePosChange}*/}
					{/*	/>*/}
					{/*	<Input*/}
					{/*		name="end.line"*/}
					{/*		type="number"*/}
					{/*		placeholder="End Line"*/}
					{/*		value={plotUnit.nodePos?.end.line || ""}*/}
					{/*		onChange={handleNodePosChange}*/}
					{/*	/>*/}
					{/*	<Input*/}
					{/*		name="end.column"*/}
					{/*		type="number"*/}
					{/*		placeholder="End Column"*/}
					{/*		value={plotUnit.nodePos?.end.column || ""}*/}
					{/*		onChange={handleNodePosChange}*/}
					{/*	/>*/}
					{/*</div>*/}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">File Path</label>
					{/*<Select onValueChange={handleFilePathChange} value={plotUnit.filePath}>*/}
					{/*	<SelectTrigger>*/}
					{/*		<SelectValue placeholder="Select file path" />*/}
					{/*	</SelectTrigger>*/}
					{/*	<SelectContent>*/}
					{/*		{attachmentOptions.map((att) => (*/}
					{/*			<SelectItem key={att.id} value={att.path}>*/}
					{/*				{att.path}*/}
					{/*			</SelectItem>*/}
					{/*		))}*/}
					{/*	</SelectContent>*/}
					{/*</Select>*/}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">Parsed Result Text</label>
					<Input name="parsedResultText" value={plotUnit.parsedResultText} onChange={handleChange}/>
				</div>

				{/*<div>*/}
				{/*	<label className="block text-sm font-medium text-gray-700">Sentence</label>*/}
				{/*	<Textarea name="sentence" value={plotUnit.sentence} onChange={handleChange} rows={4}/>*/}
				{/*</div>*/}
				<ReactQuill formats={QuillFormat} modules={QuillModules} theme="snow" value={plotUnit.sentence} onChange={(value)=>{

					setPlotUnit((prev)=> ({...prev,sentence:value}))
				}} />

				<div>
					<label className="block text-sm font-medium text-gray-700">Parsed Result Date</label>
					<div className="grid grid-cols-3 gap-2">
						<Input
							name="year"
							type="number"
							placeholder="Year"
							value={date.year}
							onChange={handleDateChange}
							max={9999}
							maxLength={4}

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
						Unix Time: {plotUnit.parsedResultUnixTime}
					</div>
				</div>

				{/*<div>*/}
				{/*	<label className="block text-sm font-medium text-gray-700">Attachments</label>*/}
				{/*	<Select*/}
				{/*		onValueChange={handleAttachmentChange}*/}
				{/*		value={plotUnit.attachments.map((att) => att.id)}*/}
				{/*		multiple*/}
				{/*	>*/}
				{/*		<SelectTrigger>*/}
				{/*			<SelectValue placeholder="Select attachments" />*/}
				{/*		</SelectTrigger>*/}
				{/*		<SelectContent>*/}
				{/*			{attachmentOptions.map((att) => (*/}
				{/*				<SelectItem key={att.id} value={att.id}>*/}
				{/*					{att.path}*/}
				{/*				</SelectItem>*/}
				{/*			))}*/}
				{/*		</SelectContent>*/}
				{/*	</Select>*/}
				{/*</div>*/}

				<Button type="submit">Save Changes</Button>
				<Button onClick={()=>props.handleModeChange("normal")}>Cancel</Button>
			</form>
		</div>
	)
}
