import HistoricaPlugin from "../../../main";
import { useState} from "react";
import ReactQuill from "react-quill";
import {QuillFormat, QuillModules} from "../../global";



export default function HeaderAndFooterEditor(props: {
	plugin: HistoricaPlugin,
	handleEdit: (s: string, type: string) => void,
	content?: string | undefined,
	type: "header" | "footer",
	setIsShow: (b:boolean)=>void
}){
	const [content,setContent] = useState<string>(props.content ? props.content : "")
	const handleSubmit = (e:React.FormEvent)=>{
		e.preventDefault()
		props.handleEdit(content,props.type)
		props.setIsShow(false)
	}

	return (
		<form onSubmit={handleSubmit} >
			<div>
				<label>Content</label>
				<ReactQuill formats={QuillFormat} modules={QuillModules} theme="snow" value={content}
							onChange={(value) => {
								setContent(value)
							}}/>
			</div>
			<div className={"flex justify-center"}>
				<button className={"w-1/2"}

						type="submit">Back
				</button>
			</div>
		</form>
	)
}
