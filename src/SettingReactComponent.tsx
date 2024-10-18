import {useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/src/ui/shadcn/Card"
import {Label} from "@/src/ui/shadcn/Label"
import {Switch} from "@/src/ui/shadcn/Switch"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/src/ui/shadcn/Select"
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/src/ui/shadcn/Table"
import {Button} from "@/src/ui/shadcn/Button"
import {
	GetAllMarkdownFileInVault,
	HistoricaSettingNg,
	PlotUnitNg,
	UpdateBlockSetting,
} from "./global";
import HistoricaPlugin from "@/main";
import {MarkdownPostProcessorContext} from "obsidian";
import {Popover, PopoverContent, PopoverTrigger} from "@/src/ui/shadcn/Popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem} from "@/src/ui/shadcn/Command"
import {ChevronsUpDownIcon} from "lucide-react";
import {Checkbox} from "@/src/ui/shadcn/Checkbox"
import {CommandList} from "cmdk";
import {Input} from "@/src/ui/shadcn/Input"
import PlotUnitNgEditor from "@/src/PlotUnitEditor";

// import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/src/ui/shadcn/Table";


function FilePickerComponent(props: {
	setting: HistoricaSettingNg,
	setSetting: (s: HistoricaSettingNg) => void,
	plugin: HistoricaPlugin,
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" className="w-[300px] justify-between">
					<div className="flex items-center gap-2 truncate">
						<span className="truncate">Select options...</span>
						<ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[300px] p-0">
				<Command>
					<CommandInput placeholder="Search options..." className="border-b px-4 py-3 focus:outline-none"/>
					<CommandEmpty className="py-3 px-4 text-muted-foreground">No options found.</CommandEmpty>
					<CommandGroup>
						<CommandList>
							{GetAllMarkdownFileInVault(props.plugin).map((tfile, index) => (
								<CommandItem
									key={index}
									className="flex items-center gap-2">
									<Checkbox
										checked={props.setting.include_files.indexOf(tfile.path) >= 0}
										onCheckedChange={(checked) => {
											let paths = props.setting.include_files
											if (checked) {
												paths.push(tfile.path)
											} else {
												paths.splice(paths.indexOf(tfile.path), 1)
											}
											props.setSetting({...props.setting, include_files: paths})

										}}
									/>
									<span>{tfile.path}</span>
								</CommandItem>
							))}
						</CommandList>
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	)


}


// function QueryEditTable(props:{
// 	setting:HistoricaSettingNg,
// 	handleQueryChange: (index:number,key:string,value:string) => void,
// 	handleRemoveQuery: (index:number)=> void,
// 	handleAddQuery:()=>void
//
//
// }){
// 	return (
// 		<div className={"grid gap-4"}>
//
// 			<Label>Queries</Label>
// 			<Table>
// 				<TableHeader>
// 					<TableRow>
// 						<TableHead>Key</TableHead>
// 						<TableHead>Start</TableHead>
// 						<TableHead>End</TableHead>
// 						<TableHead>Actions</TableHead>
// 					</TableRow>
// 				</TableHeader>
// 				<TableBody>
// 					{props.setting.query.map((query, index) => (
// 						<TableRow key={index}>
// 							<TableCell>
// 								<Input value={query.key} onChange={(e) => {
// 									props.handleQueryChange(index,"key",e.target.value)
// 								}} />
// 							</TableCell>
// 							<TableCell>
// 								<Input value={query.start} onChange={(e) => props.handleQueryChange(index, "start", e.target.value)} />
// 							</TableCell>
// 							<TableCell>
// 								<Input value={query.end} onChange={(e) => props.handleQueryChange(index, "end", e.target.value)} />
// 							</TableCell>
// 							<TableCell>
// 								<Button variant="ghost" size="icon" onClick={() => props.handleRemoveQuery(index)}>
// 									<TrashIcon className="w-4 h-4" />
// 									<span className="sr-only">Remove query</span>
// 								</Button>
// 							</TableCell>
// 						</TableRow>
// 					))}
// 				</TableBody>
// 			</Table>
// 			<Button onClick={props.handleAddQuery}>Add Query</Button>
//
// 		</div>
// 	)
// }




export default function SettingReactComponent(props: {
	setting: HistoricaSettingNg,
	setSetting: (s: HistoricaSettingNg) => void,
	blocCtx: MarkdownPostProcessorContext,
	plugin: HistoricaPlugin,
	handleSaveCache: () => void

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

	const setPlotUnits = (us:PlotUnitNg[])=>{
		setSetting({...setting, custom_units:us})
	}

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
			<div  className="grid gap-6">
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
					<div className="grid gap-2">
						<Label htmlFor="implicitTime">Implicit Time</Label>
						<Switch
							id="implicitTime"
							checked={setting.implicit_time}
							onCheckedChange={(value) => handleChange("implicitTime", value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="sort">Sort</Label>
						<Select
							value={setting.sort}
							onValueChange={(v) => handleChange("sort", v)}
						>
							<SelectTrigger>
								<SelectValue placeholder={"Sort order"}/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem key={"asc"} value="asc">Ascending</SelectItem>
								<SelectItem key={"desc"} value="desc">Descending</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="grid gap-2">
						<Label htmlFor="cache">Using cache</Label>
						<Switch
							id="cache"
							checked={setting.cache}
							onCheckedChange={(value) => {
								handleChange("cache", value)
								if (value) {
									props.handleSaveCache()
								}
							}}
						/>
					</div>
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
				<div className="grid gap-2">
					<Label htmlFor="includeFiles">Include Files</Label>
					<FilePickerComponent setting={setting} setSetting={setSetting} plugin={props.plugin}/>
				</div>
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
				<PlotUnitNgEditor
					plotUnits={setting.custom_units}
					setPlotUnits={setPlotUnits}
					plugin={props.plugin}
				/>

				<div>
					<div>Preview your settings</div>
					<pre className={"border rounded-lg"}>
						<code>
							{JSON.stringify(setting, null,2)}
					</code>
					</pre>
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


