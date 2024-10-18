import HistoricaPlugin from "@/main";
import {WelcumModal} from "@/src/WelcumModal";
import {CircleHelp} from "lucide-react";
import { ReadImage} from "@/src/global";

export const Pages = [
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
	setPage: (p: string) => void,
	handleConvertToPngAndSave?: () => void,
	handleConvertToPngAndCopy?: () => void,
	handleConvertToPdfAndSave?: () => void,
	handleSaveCache?: () => void,
	plugin: HistoricaPlugin
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
		<div className={"flex flex-row justify-around p-2 "}>
			{Pages.map((p, i) => {
				return <button
					key={i}
					onClick={() => {
						props.setPage(p.page)
					}}
				>{p.title}</button>
			})}
			{props.handleConvertToPngAndSave ?
				<button onClick={props.handleConvertToPngAndSave}>Save as Image</button> : null}
			{props.handleConvertToPngAndCopy ?
				<button onClick={props.handleConvertToPngAndCopy}>Copy as Image</button> : null}
			{props.handleSaveCache ? <button
				onClick={props.handleSaveCache}
			>Save and toogle using cache</button> : null}
			<button
				title={""}
			onClick={()=>{
				new WelcumModal(props.plugin.app).open()
			}}
			><CircleHelp /></button>
			<button
			onClick={async ()=>{
				const content = await ReadImage(props.plugin,"attachments/artofdesign.jpeg")
				console.log(content)
			}}
			>
				Test image display
			</button>

		</div>
	)

}
