import {useEffect, useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/src/ui/shadcn/Card"
import {Label} from "@/src/ui/shadcn/Label"
import {Switch} from "@/src/ui/shadcn/Switch"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/src/ui/shadcn/Select"
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/src/ui/shadcn/Table"
import {Button} from "@/src/ui/shadcn/Button"
import {HistoricaSettingNg,} from "./global";
import {RadioGroup, RadioGroupItem} from "@/src/ui/shadcn/RadioGroup";
import TOML from "@ltd/j-toml"
import HistoricaPlugin from "@/main";
import {MarkdownPostProcessorContext, TFile, TFolder} from "obsidian";
import {UpdateBlockSetting} from "@/src/backgroundLogic/HistoricaBlockManager";
import {Popover, PopoverContent, PopoverTrigger} from "@/src/ui/shadcn/Popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem} from "@/src/ui/shadcn/Command"
import {ChevronsUpDownIcon} from "lucide-react";
import {Checkbox} from "@/src/ui/shadcn/Checkbox"
import {CommandList} from "cmdk";
import {Input} from "@/src/ui/shadcn/Input"
function PathPickerComponent(props: {
	setting: HistoricaSettingNg,
	setSetting: (s: HistoricaSettingNg) => void,
	plugin: HistoricaPlugin

}) {

	// useEffect(() => {
	// 	console.log(getAllDirInVault(props.plugin))
	// }, []);

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
							{getAllDirInVault(props.plugin).map((tfolder, index) => (
							<CommandItem
								key={index}
								className="flex items-center gap-2">
								<Checkbox
									checked={props.setting.custom_path.indexOf(tfolder.path) >= 0}
									onCheckedChange={(checked) => {
										let paths = props.setting.custom_path
										if (checked) {
											paths.push(tfolder.path)
										} else {
											paths.splice(paths.indexOf(tfolder.path), 1)
										}
										props.setSetting({...props.setting, custom_path: paths})

									}}
								/>
								<span>{tfolder.path}</span>
							</CommandItem>
						))}
						</CommandList>
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	)
}


function FilePickerComponent(props:{
	setting: HistoricaSettingNg,
    setSetting: (s: HistoricaSettingNg) => void,
    plugin: HistoricaPlugin,
}){
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
							{getAllMarkdownFileInVault(props.plugin).map((tfile, index) => (
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

function getAllDirInVault(plugin: HistoricaPlugin) {
	const fs = plugin.app.vault.getFiles()
	let dirs = new Set<TFolder>([])
	fs.map(f => {
		if (f.parent) dirs.add(f.parent)
	})
	return Array.from(dirs)

}

function getAllMarkdownFileInVault(plugin:HistoricaPlugin){
	const fs = plugin.app.vault.getMarkdownFiles()
	let files = new Set<TFile>()
	fs.map(f=> files.add(f))
	return Array.from(files)
}

function PathListComponent(props: {
	setting: HistoricaSettingNg,
	setSetting: (s: HistoricaSettingNg) => void,
	plugin: HistoricaPlugin,
}) {

	function handleChange(v: string) {
		if (v === "all") {
			props.setSetting({...props.setting, path_option: "all"})
		} else if (v === "current") {
			props.setSetting({...props.setting, path_option: "current"})
		} else if (v === "custom") {
			props.setSetting({...props.setting, path_option: "custom"})
		}
	}

	return (
		<div>
			<div className="grid gap-2">
				<Label>Path List</Label>
				<RadioGroup
					onValueChange={handleChange}
					defaultValue={props.setting.path_option}
					className="flex flex-col gap-2"
				>
					<Label className="flex items-center gap-2">
						<RadioGroupItem value="all"/>
						All
					</Label>
					<Label className="flex items-center gap-2">
						<RadioGroupItem value="current"/>
						Current
					</Label>
					<Label className="flex items-center gap-2">
						<RadioGroupItem value="custom"/>
						Custom
					</Label>
				</RadioGroup>
				{props.setting.path_option === "custom" && <div className="grid gap-2">
					<Label htmlFor="pathListOptions">Path List Options</Label>
					<PathPickerComponent setting={props.setting} setSetting={props.setSetting} plugin={props.plugin}/>

					<div/>
				</div>}
			</div>

		</div>
	)
}

function ReviewPinTime(props:{
	input:string,
	plugin:HistoricaPlugin
}) {

	const [parsed,setParsed] = useState(props.plugin.historicaChrono.customChrono.parse(props.input.toString()))
	useEffect(() => {
		setParsed(props.plugin.historicaChrono.customChrono.parse(props.input))
	}, [props.input]);

	if (parsed.length > 0){
		return <div className={"grid gap-2"}><Label htmlFor={"parsedPinTime"}>Parsed pin time</Label>
			<div
				id={"parsedPinTime"}>{parsed[0].start.date().toString()}</div>
		</div>

	} else {
		return <div>This is not a valid pin_time</div>
	}

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

	useEffect(() => {
		props.plugin.historicaChrono.setupCustomChrono(setting.language)
			.then(() => console.log("Oops here we go again"))

	}, [setting.language]);



	return <Card className="w-full max-w-4xl">
		<CardHeader>
			<CardTitle>HistoricaSettingNg Configuration</CardTitle>
			<CardDescription>Customize your HistoricaSettingNg settings.</CardDescription>
		</CardHeader>
		<CardContent>
			<form onSubmit={handleSubmit} className="grid gap-6">
				<div className="grid grid-cols-2 gap-4">
					<div className="grid gap-2">
						<Label htmlFor="summary">Summary</Label>
						<Switch
							id="summary"
							checked={setting.summary}
							onCheckedChange={(value) => handleChange("summary", value)}
						/>
					</div>
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
						<Label htmlFor="smartTheme">Smart Theme</Label>
						<Switch
							id="smartTheme"
							checked={setting.smart_theme}
							onCheckedChange={(value) => handleChange("smartTheme", value)}
						/>
					</div>
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
					<PathListComponent setting={setting} setSetting={setSetting} plugin={props.plugin}/>

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
					<ReviewPinTime input={setting.pin_time.toString()} plugin={props.plugin}/>

				</div>
				<div>
					<div>Preview your settings</div>
					<pre className={"border rounded-lg"}>
						<code>
							{/*@ts-ignore*/}
						{TOML.stringify(setting , {
							newline: '\n',
							indent: '\t',
						})}
					</code>
					</pre>
				</div>
				{/*<div className="grid gap-4">*/}
				{/*	<Label>Queries</Label>*/}
				{/*	<Table>*/}
				{/*		<TableHeader>*/}
				{/*			<TableRow>*/}
				{/*				<TableHead>Key</TableHead>*/}
				{/*				<TableHead>Start</TableHead>*/}
				{/*				<TableHead>End</TableHead>*/}
				{/*				<TableHead>Actions</TableHead>*/}
				{/*			</TableRow>*/}
				{/*		</TableHeader>*/}
				{/*		<TableBody>*/}
				{/*			{setting.query.map((query, index) => (*/}
				{/*				<TableRow key={index}>*/}
				{/*					<TableCell>*/}
				{/*						<Input value={query.key} onChange={(e) => handleQueryChange(index, "key", e.target.value)} />*/}
				{/*					</TableCell>*/}
				{/*					<TableCell>*/}
				{/*						<Input value={query.start} onChange={(e) => handleQueryChange(index, "start", e.target.value)} />*/}
				{/*					</TableCell>*/}
				{/*					<TableCell>*/}
				{/*						<Input value={query.end} onChange={(e) => handleQueryChange(index, "end", e.target.value)} />*/}
				{/*					</TableCell>*/}
				{/*					<TableCell>*/}
				{/*						<Button variant="ghost" size="icon" onClick={() => handleRemoveQuery(index)}>*/}
				{/*							<TrashIcon className="w-4 h-4" />*/}
				{/*							<span className="sr-only">Remove query</span>*/}
				{/*						</Button>*/}
				{/*					</TableCell>*/}
				{/*				</TableRow>*/}
				{/*			))}*/}
				{/*		</TableBody>*/}
				{/*	</Table>*/}
				{/*	<Button onClick={handleAddQuery}>Add Query</Button>*/}
				{/*</div>*/}
				<div className="flex justify-end">
					<Button

						type="submit">Save Settings</Button>
				</div>
			</form>
		</CardContent>
	</Card>
}


