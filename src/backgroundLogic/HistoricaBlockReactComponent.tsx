import {MarkdownPostProcessorContext, MarkdownView, TFile} from "obsidian";
import HistoricaPlugin from "@/main";
import {HistoricaSettingNg, NodeFromParseTree, SentenceWithOffset} from "@/src/global";
import {PropsWithChildren, useEffect, useState} from "react";
import MarkdownProcesser from "@/src/MarkdownProcesser";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle
} from "@/src/ui/shadcn/NavigationMenu"
import {cn} from "@/lib/utils";
import SettingReactComponent from "@/src/SettingReactComponent";



function ListItem(props: PropsWithChildren<{
	title: string,
	page: string,
	className?: string,
	setPage: (p: string) => void
}>) {
	return (
		<NavigationMenuLink

			className={navigationMenuTriggerStyle()}>
			<li
				onClick={() => {
					props.setPage(props.page)

				}}

				className={cn(
					"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
					props.className
				)}

			>
				<div className="text-sm font-medium leading-none">{props.title}</div>
				<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
					{props.children}
				</p>

			</li>
		</NavigationMenuLink>
	)

}

const pages = [
	{
		title: "Timeline",
		page: "timeline"
	},
	{
		title: "Setting",
		page: "setting"
	}
]

export function NavigationMenuReactComponent(props: {
	page: string,
	setPage: (p: string) => void
}) {

	// return <NavigationMenu>
	// 	<NavigationMenuList >
	// 		<NavigationMenuItem>
	// 			<NavigationMenuTrigger className={"m-0 "}>Menu</NavigationMenuTrigger>
	// 			<NavigationMenuContent>
	// 				<ul className="grid w-[200px] gap-4 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
	// 					{pages.map(p => {
	// 						return <ListItem key={p.page} title={p.title} page={p.page} setPage={props.setPage}
	//
	// 						/>
	// 					})}
	//
	// 				</ul>
	// 			</NavigationMenuContent>
	// 		</NavigationMenuItem>
	// 	</NavigationMenuList>
	// </NavigationMenu>

	return (
		<div>
			{pages.map((p,i)=>{
				return <button
					key={i}
				onClick={()=>{
					props.setPage(p.page)
				}}
				>{p.title}</button>
			})}
		</div>
	)

}

async function JumpToParagraphPosition(n: NodeFromParseTree,p:HistoricaPlugin) {
	const fileNeedToBeOpen = p.app.vault.getAbstractFileByPath(n.file.path)
	const leaf = p.app.workspace.getLeaf(true)
	if (fileNeedToBeOpen instanceof TFile) {
		await leaf.openFile(fileNeedToBeOpen)
		await leaf.setViewState({
			type: "markdown",
		})
		// console.log(leaf.getViewState())

		let view = leaf.view as MarkdownView

		let startLine = n.node.position?.start.line ? n.node.position.start.line - 1 : 0
		let startCol = n.node.position?.start.column ? n.node.position.start.column - 1 : 0
		let endLine = n.node.position?.end.line ? n.node.position.end.line - 1 : 0
		let endCol = n.node.position?.end.column ? n.node.position.end.column - 1 : 0


		view.editor.setSelection({
			line: startLine,
			ch: startCol
		}, {
			line: endLine,
			ch: endCol
		})

		view.editor.focus()
		view.editor.scrollTo(0, startLine)

	}
}


export function HistoricaBlockReactComponent(props: {
	src: string,
	ctx: MarkdownPostProcessorContext,
	thisPlugin: HistoricaPlugin
	setting: HistoricaSettingNg
}) {

	const [sentences, setSentences] = useState<SentenceWithOffset[]>([])





	useEffect(() => {
		const extractTimeline = async () => {
			const markdownProcesser = new MarkdownProcesser(props.thisPlugin, props.setting)
			await markdownProcesser.parseAllFilesNg()
			// const allnodes = markdownProcesser.nodes
			const currentFile = props.thisPlugin.app.workspace.getActiveFile()
			if (currentFile) {
				let text = await props.thisPlugin.app.vault.read(currentFile)
				const sentencesWithOffSet = await markdownProcesser.ExtractValidSentences(text)
				setSentences(sentencesWithOffSet)

			}


			// console.log(allnodes)
		}
		extractTimeline().then()


	}, [])

	const [internalSetting, setInternalSetting] =
		useState<HistoricaSettingNg>(structuredClone(props.setting))
	const [page, setPage] = useState("timeline")



	if (page === "timeline") {
		return <div>
			<NavigationMenuReactComponent page={page} setPage={setPage}/>
			<ul>
				{sentences.map((s, i) => {
					if (s.parsedResult.length != 0) {
						let formattedText = s.text
						s.parsedResult.map((r) => {
							formattedText = formattedText.replace(r.text, `<historica-mark class="text-rose-500">${r.text}</historica-mark>`)
						})
						return <li
							className={"border"}
							key={i}
							onClick={async () => {
								await JumpToParagraphPosition(s.node,props.thisPlugin)
							}}
							dangerouslySetInnerHTML={{__html: formattedText}}
						></li>

					}
					return null
				})}
			</ul>
		</div>

	}

	if (page === "setting") {
		return <div>
			<NavigationMenuReactComponent page={page} setPage={setPage}/>
			<SettingReactComponent
				blocCtx={props.ctx}
				plugin={props.thisPlugin}
				setting={internalSetting}
				setSetting={setInternalSetting}

			/>
		</div>
	}
	return <>Wait, something go wrong</>
}
