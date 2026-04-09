import HistoricaPlugin from "@/main";
import { useState} from "react";
import ReactQuill from "react-quill-new";
const QuillFormat = [
	'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
	'list', 'bullet', 'indent', 'link', 'image', 'code-block',
	'formula', 'video', 'table', 'font', 'color', 'background', 'align', 'script'
]
const QuillModules = {
	toolbar: [
		[{'header': [1, 2, 3, 4, 5, 6, false]}], [{'font': []}],
		['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
		[{'indent': '-1'}, {'indent': '+1'}],
		[{'list': 'ordered'}, {'list': 'bullet'}, {'list': 'check'}],
		['link', 'image', 'video', 'formula'],
		[{'script': 'sub'}, {'script': 'super'}],
		[{'color': []}, {'background': []}], [{'align': []}], ['clean']
	],
}



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
				<ReactQuill className={"ql-editor"} formats={QuillFormat} modules={QuillModules} theme="snow" value={content}
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
