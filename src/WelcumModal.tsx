import { App, Modal } from "obsidian";
import {createRoot} from "react-dom/client";
import Welcum from "@/src/Welcum.mdx"
import {StrictMode} from "react";

export function WelcumContent(props:{
	version:string
}){
	return <div className={"prose lg:prose-xl prose-slate"}>
		<Welcum/>

	</div>
}

export class WelcumModal extends Modal {
	constructor(app: App) {
		super(app);
		let root = this.contentEl.createEl('div',{
			cls:'root'
		})

		let reactRoot = createRoot(root)
		reactRoot.render(
			<StrictMode>
				<WelcumContent version={"0.3.0"}/>

		</StrictMode>)

	}



}
