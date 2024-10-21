import HistoricaPlugin from "@/main";




export function NavigationMenuReactComponent(props: {
	mode: string,
	setMode: (p: string) => void,
	handleConvertToPngAndSave?: () => void,
	handleConvertToPngAndCopy?: () => void,
	handleConvertToPdfAndSave?: () => void,
	handleSaveCache?: () => void,
	plugin: HistoricaPlugin
}) {


	return (
		<div className={"grid grid-cols-1 gap-4 "}>
			{props.handleConvertToPngAndSave ?
				<button onClick={props.handleConvertToPngAndSave}>Export image as file</button> : null}
			{props.handleConvertToPngAndCopy ?
				<button onClick={props.handleConvertToPngAndCopy}>Export image to clipboard</button> : null}
			{props.handleSaveCache ? <button
				onClick={props.handleSaveCache}
			>Save</button> : null}
			<button onClick={()=>props.setMode("normal")}>I just take a glimpse, back!</button>

		</div>
	)

}
