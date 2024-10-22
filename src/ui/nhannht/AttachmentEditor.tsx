"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/src/ui/shadcn/Button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/src/ui/shadcn/Command"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/src/ui/shadcn/Popover"
import { Label } from "@/src/ui/shadcn/Label"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/ui/shadcn/Card"
import {Attachment, GetAllFileInVault} from "../../global";
import HistoricaPlugin from "../../../main";
import {CommandList} from "cmdk";
import ImageFromPath from "@/src/ui/nhannht/ImageFromPath";



export default function AttachmentEditor(props:{
	plotUnitId: string,
	attachments:Attachment[],
	setAttachments: (pId:string,as:Attachment[])=>void,
	plugin:HistoricaPlugin
}) {

	const [foldedAttachments, setFoldedAttachments] = React.useState<Set<string>>(new Set())

	// const addAttachment = () => {
	// 	const newAttachment: Attachment = {
	// 		id: GenerateRandomId(),
	// 		path: "",
	// 	}
	// 	props.setAttachments(props.plotUnitId,[...props.attachments, newAttachment])
	// }

	const removeAttachment = (id: string) => {
		props.setAttachments(props.plotUnitId, props.attachments.filter(attachment => attachment.id !== id))
		setFoldedAttachments(prev => {
			const newSet = new Set(prev)
			newSet.delete(id)
			return newSet
		})
	}

	const updateAttachment = (id: string, updates: Partial<Attachment>) => {
		// console.log("Hello from updateAttachment")
		props.setAttachments(props.plotUnitId, props.attachments.map(attachment =>
			attachment.id === id ? { ...attachment, ...updates } : attachment
		))
	}

	const toggleFold = (id: string) => {
		setFoldedAttachments(prev => {
			const newSet = new Set(prev)
			if (newSet.has(id)) {
				newSet.delete(id)
			} else {
				newSet.add(id)
			}
			return newSet
		})
	}



	return (
		<div  className="space-y-4">
			{props.attachments.map((attachment,index) => (
				<Card key={index} className="w-full">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Attachment {attachment.id}
						</CardTitle>
						<div className="flex space-x-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => toggleFold(attachment.id)}
							>
								{foldedAttachments.has(attachment.id) ? (
									<ChevronDown className="h-4 w-4" />
								) : (
									<ChevronUp className="h-4 w-4" />
								)}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => removeAttachment(attachment.id)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</CardHeader>
					{!foldedAttachments.has(attachment.id) && (
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor={`path-${attachment.id}`}>Path</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											id={`path-${attachment.id}`}
											variant="outline"
											role="combobox"
											className="w-full justify-between"
										>
											{attachment.path || "Select path..."}
											<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="max-w-96 p-0 max-h-60 overflow-y-auto">
										<Command>
											<CommandInput placeholder="Search path..." />
											<CommandEmpty>No path found.</CommandEmpty>
											<CommandGroup>
												<CommandList>
													{GetAllFileInVault(props.plugin).map((file,i) => (
														<CommandItem
															key={i}
															onSelect={() => updateAttachment(attachment.id, { path:file.path })}
														>
															<Check
																className={cn(
																	"mr-2 h-4 w-4",
																	attachment.path === file.path ? "opacity-100" : "opacity-0"
																)}
															/>
															{["png","jpeg","jpg"].includes(file.extension) ? <ImageFromPath path={file.path} plugin={props.plugin}/> : <div className={"rounded-full p-4"}>{file.extension.toUpperCase()}</div>}
															{file.path}
														</CommandItem>
													))}

												</CommandList>
											</CommandGroup>
										</Command>
									</PopoverContent>
								</Popover>
							</div>


						</CardContent>
					)}
				</Card>
			))}

			{/*<Button type="button" onClick={addAttachment} className="w-full">*/}
			{/*	<Plus className="mr-2 h-4 w-4" /> Add Attachment*/}
			{/*</Button>*/}
		</div>
	)
}
