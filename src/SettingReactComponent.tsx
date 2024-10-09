import {useEffect, useRef, useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/src/ui/shadcn/Card"
import {Label} from "@/src/ui/shadcn/Label"
import {Switch} from "@/src/ui/shadcn/Switch"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/src/ui/shadcn/Select"
import {Input} from "@/src/ui/shadcn/Input"
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/src/ui/shadcn/Table"
import {Button} from "@/src/ui/shadcn/Button"
import {HistoricaSettingNg,} from "./global";
import {RadioGroup, RadioGroupItem} from "@/src/ui/shadcn/RadioGroup";
import TOML from "@ltd/j-toml"
import HistoricaPlugin from "@/main";
import {MarkdownPostProcessorContext} from "obsidian";
import {UpdateBlockSetting} from "@/src/backgroundLogic/HistoricaBlockManager";




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
					{/*<div className="grid gap-2">*/}
					{/*	<Label>Path List</Label>*/}
					{/*	<RadioGroup*/}
					{/*		onValueChange={(value) => handleChange("pathList", value)}*/}
					{/*		className="flex flex-col gap-2"*/}
					{/*	>*/}
					{/*		<Label className="flex items-center gap-2">*/}
					{/*			<RadioGroupItem value="All"/>*/}
					{/*			All*/}
					{/*		</Label>*/}
					{/*		<Label className="flex items-center gap-2">*/}
					{/*			<RadioGroupItem value="Current"/>*/}
					{/*			Current*/}
					{/*		</Label>*/}
					{/*		<Label className="flex items-center gap-2">*/}
					{/*			<RadioGroupItem value="Custom"/>*/}
					{/*			Custom*/}
					{/*		</Label>*/}
					{/*	</RadioGroup>*/}
					{/*	{setting.path_list === "Custom" && <div className="grid gap-2">*/}
					{/*		<Label htmlFor="pathListOptions">Path List Options</Label>*/}
					{/*		<div/>*/}
					{/*	</div>}*/}
					{/*</div>*/}
				</div>
				{/*<div className="grid gap-2">*/}
				{/*	<Label htmlFor="includeFiles">Include Files</Label>*/}
				{/*	<Select*/}
				{/*		onValueChange={(value) => handleChange("includeFiles", value)}*/}
				{/*	>*/}
				{/*		<SelectTrigger className="w-full">*/}
				{/*			<SelectValue placeholder="Select files"/>*/}
				{/*		</SelectTrigger>*/}
				{/*		<SelectContent className="w-full">*/}
				{/*			{setting.include_files.map((option, index) => <SelectItem key={index}*/}
				{/*																	  value={option.valueOf()}>*/}
				{/*				{option}*/}
				{/*			</SelectItem>)}*/}
				{/*		</SelectContent>*/}
				{/*	</Select>*/}
				{/*</div>*/}
				{/*<div className="grid grid-cols-2 gap-4">*/}
				{/*	<div className="grid gap-2">*/}
				{/*		<Label htmlFor="pinTime">Pin Time</Label>*/}
				{/*		<Input*/}
				{/*			id="pinTime"*/}
				{/*			value={setting.pin_time.toString()}*/}
				{/*			onChange={(e) => handleChange("pinTime", e.target.value)}*/}
				{/*		/>*/}
				{/*	</div>*/}
				{/*</div>*/}
				<div>
					<div>Preview your settings</div>
					<pre className={"border rounded-lg"}>
						<code>
						{TOML.stringify(setting, {
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


