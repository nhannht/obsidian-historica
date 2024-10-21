import {useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/src/ui/shadcn/Card"
import {Label} from "@/src/ui/shadcn/Label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/src/ui/shadcn/Select"
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/src/ui/shadcn/Table"
import {Button} from "@/src/ui/shadcn/Button"
import {HistoricaSettingNg, UpdateBlockSetting,} from "./global";
import HistoricaPlugin from "@/main";
import {MarkdownPostProcessorContext} from "obsidian";
import {ChevronDown, ChevronUp} from "lucide-react";
import {Input} from "@/src/ui/shadcn/Input"
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/src/ui/shadcn/Collapsible"

// import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/src/ui/shadcn/Table";


function CollapsibleSettingPreview(props: {
	content: string,
}) {
	const [isOpen, setIsOpen] = useState(false)
	const previewContent = props.content.trim().split("\n").slice(0, 3).join('\n')
	const remainingContent = props.content.trim().split("\n").slice(3).join('\n')

	return (
		<div className="w-full max-w-2xl mx-auto ">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div>
					<pre className={"rounded-none"}>
						<code>
						{previewContent.split('\n\n').map((paragraph, index) => (
							<p key={index}>{paragraph}</p>
						))}
					</code>
					</pre>
				</div>

				<CollapsibleContent>
					<pre className={"rounded-none"}>
						<code>
						{remainingContent.split('\n\n').map((paragraph, index) => (
							<p key={index}>{paragraph}</p>
						))}
						</code>
					</pre>
				</CollapsibleContent>

				<CollapsibleTrigger asChild>
					<Button variant="outline" className="w-full mt-2">
						{isOpen ? (
							<>
								<ChevronUp className="h-4 w-4 mr-2"/>
								Show Less
							</>
						) : (
							<>
								<ChevronDown className="h-4 w-4 mr-2"/>
								Read More
							</>
						)}
					</Button>
				</CollapsibleTrigger>
			</Collapsible>
		</div>
	)
}


export default function SettingReactComponent(props: {
	setting: HistoricaSettingNg,
	setSetting: (s: HistoricaSettingNg) => void,
	blocCtx: MarkdownPostProcessorContext,
	plugin: HistoricaPlugin,


}) {

	const [setting, setSetting] = useState<HistoricaSettingNg>(structuredClone(props.setting))
	const HistoricaSupportLanguages = {
		en: "English",
		ja: "Japanese",
		fr: "French",
		de: "German",
		nl: "Dutch",
		ru: "Russian",
		uk: "Ukrainian",
		pt: "Portuguese",
		"zh.hant": "Chinese (Traditional)",
	}
	const handleChange = (field: string, value: string | boolean) => {
		setSetting((prev) => ({...prev, [field]: value}))
	}

	const handleSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault()
		await UpdateBlockSetting(setting, props.blocCtx, props.plugin)

	}

	// const setPlotUnits = (us: PlotUnitNg[]) => {
	// 	setSetting({...setting, custom_units: us})
	// }

	// function handleQueryChange(index:number,key:string,value:string){
	// 	let newQuery = [...setting.query]
	//
	// 	if (key === "key"){
	// 		newQuery[index].key = value
	// 	} else if (key==="start"){
	// 		newQuery[index].start = value
	// 	} else if (key === "end"){
	// 		newQuery[index].end = value
	// 	}
	//
	// 	setSetting({...setting,query:newQuery})
	//
	// }
	//
	// function handleRemoveQuery(index:number){
	// 	let newQuery = [...setting.query]
	// 	newQuery = newQuery.filter((_, i) => i!== index)
	// 	setSetting({...setting,query: newQuery})
	// }
	//
	// function handleAddQuery(){
	// 	const currentTime = new Date().getTime().toString();
	// 	let hash = 0;
	// 	for (let i = 0; i < currentTime.length; i++) {
	// 		const char = currentTime.charCodeAt(i);
	// 		hash = ((hash << 5) - hash) + char;
	// 		hash |= 0; // Convert to 32bit integer
	// 	}
	// 	let randomKey = hash.toString();
	// 	let newQuery = [...setting.query]
	// 	// console.log(newQuery)
	// 	newQuery.push({key: randomKey, start: "", end: ""})
	// 	// console.log(newQuery)
	// 	setSetting({...setting,query:newQuery})
	// }


	// useEffect(() => {
	// 	props.plugin.historicaChrono.setupCustomChrono(setting.language)
	// 		.then(() => console.log("Oops here we go again"))
	//
	// }, [setting.language]);


	return <Card className="w-full max-w-4xl">
		<CardHeader>
			<CardTitle>HistoricaSettingNg Configuration</CardTitle>
			<CardDescription>Customize your HistoricaSettingNg settings.</CardDescription>
		</CardHeader>
		<CardContent>
			<div className="grid gap-6">
				<div className="grid grid-cols-2 gap-4">
					{/*<div className="grid gap-2">*/}
					{/*	<Label htmlFor="summary">Summary</Label>*/}
					{/*	<Switch*/}
					{/*		id="summary"*/}
					{/*		checked={setting.summary}*/}
					{/*		onCheckedChange={(value) => handleChange("summary", value)}*/}
					{/*	/>*/}
					{/*</div>*/}
					<div className="grid gap-2">
						<Label htmlFor="style">Style</Label>
						<Select
							value={setting.style.toString()}
							onValueChange={(value) => handleChange("style", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select style"/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">Style 1</SelectItem>
								<SelectItem value="2">Style 2</SelectItem>
								<SelectItem value="3">Style 3</SelectItem>
								<SelectItem value="default">Default</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-4">
					{/*<div className="grid gap-2">*/}
					{/*	<Label htmlFor="implicitTime">Implicit Time</Label>*/}
					{/*	<Switch*/}
					{/*		id="implicitTime"*/}
					{/*		checked={setting.implicit_time}*/}
					{/*		onCheckedChange={(value) => handleChange("implicitTime", value)}*/}
					{/*	/>*/}
					{/*</div>*/}
					{/*<div className="grid gap-2">*/}
					{/*	<Label htmlFor="sort">Sort</Label>*/}
					{/*	<Select*/}
					{/*		value={setting.sort}*/}
					{/*		onValueChange={(v) => handleChange("sort", v)}*/}
					{/*	>*/}
					{/*		<SelectTrigger>*/}
					{/*			<SelectValue placeholder={"Sort order"}/>*/}
					{/*		</SelectTrigger>*/}
					{/*		<SelectContent>*/}
					{/*			<SelectItem key={"asc"} value="asc">Ascending</SelectItem>*/}
					{/*			<SelectItem key={"desc"} value="desc">Descending</SelectItem>*/}
					{/*		</SelectContent>*/}
					{/*	</Select>*/}
					{/*</div>*/}
				</div>

				<div className="grid grid-cols-2 gap-4">
					{/*<div className="grid gap-2">*/}
					{/*	<Label htmlFor="cache">Using cache</Label>*/}
					{/*	<Switch*/}
					{/*		id="cache"*/}
					{/*		checked={setting.cache}*/}
					{/*		onCheckedChange={(value) => {*/}
					{/*			handleChange("cache", value)*/}
					{/*			if (value) {*/}
					{/*				props.handleSaveCache()*/}
					{/*			}*/}
					{/*		}}*/}
					{/*	/>*/}
					{/*</div>*/}
					{/*<div className="grid gap-2"></div>*/}
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="grid gap-2">
						<Label htmlFor="language">Language</Label>
						<Select
							value={setting.language}
							onValueChange={(value) => handleChange("language", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select language"/>
							</SelectTrigger>
							<SelectContent>
								{Object.entries(HistoricaSupportLanguages).map(([lang, label]) => <SelectItem key={lang}
																											  value={lang}>
									{label}
								</SelectItem>)}
							</SelectContent>
						</Select>
					</div>

				</div>
				{/*<div className="grid gap-2">*/}
				{/*	<Label htmlFor="includeFiles">Include Files</Label>*/}
				{/*	<FilePickerComponent setting={setting} setSetting={setSetting} plugin={props.plugin}/>*/}
				{/*</div>*/}
				<div className="grid grid-cols-2 gap-4">
					<div className="grid gap-2">
						<Label htmlFor="pinTime">Pin Time</Label>
						<Input
							id="pinTime"
							value={setting.pin_time.toString()}

							onChange={(e) => handleChange("pin_time", e.target.value)}
						/>
					</div>
					{/*<ReviewPinTime input={setting.pin_time.toString()} plugin={props.plugin}/>*/}

				</div>

				{/*<QueryEditTable setting={setting} handleQueryChange={handleQueryChange} handleRemoveQuery={handleRemoveQuery} handleAddQuery={handleAddQuery}/>*/}
				{/*<PlotUnitNgEditor*/}
				{/*	plotUnits={setting.custom_units}*/}
				{/*	setPlotUnits={setPlotUnits}*/}
				{/*	plugin={props.plugin}*/}
				{/*/>*/}

				<div>
					<div>Preview your settings</div>

					<CollapsibleSettingPreview content={JSON.stringify(setting, null, 2)}/>

				</div>

				<div className="flex justify-end">
					<Button
						onClick={handleSubmit}

						type="submit">Save Settings</Button>
				</div>
			</div>

		</CardContent>
	</Card>
}


