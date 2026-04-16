import { useEffect, useRef, useState } from "react"
import { Component, MarkdownRenderer } from "obsidian"
import { EditorView, keymap } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { markdown } from "@codemirror/lang-markdown"
import { defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { defaultKeymap } from "@codemirror/commands"
import HistoricaPlugin from "@/main"

/**
 * Annotation field: CM6 editor when editing, Obsidian MarkdownRenderer preview when idle.
 * Click to enter edit mode, blur to save and switch back to preview.
 */
export function MarkdownNote(props: {
	value: string
	onChange: (v: string) => void
	onBlur: () => void
	plugin: HistoricaPlugin
	sourcePath: string
}) {
	const [editing, setEditing] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)
	const previewRef = useRef<HTMLDivElement>(null)
	const onChangeRef = useRef(props.onChange)
	const onBlurRef = useRef(props.onBlur)
	onChangeRef.current = props.onChange
	onBlurRef.current = props.onBlur

	// Mount/destroy CM6 editor when entering/leaving edit mode
	useEffect(() => {
		if (!editing || !containerRef.current) return
		const el = containerRef.current
		el.replaceChildren()
		const view = new EditorView({
			state: EditorState.create({
				doc: props.value,
				extensions: [
					keymap.of(defaultKeymap),
					markdown(),
					syntaxHighlighting(defaultHighlightStyle),
					EditorView.updateListener.of(update => {
						if (update.docChanged) {
							onChangeRef.current(update.state.doc.toString())
						}
					}),
					EditorView.domEventHandlers({
						blur: () => {
							setEditing(false)
							onBlurRef.current()
						},
					}),
					EditorView.theme({
						"&": {
							fontSize: "0.75rem",
							minHeight: "2rem",
							backgroundColor: "var(--background-primary)",
						},
						"&.cm-focused": { outline: "1px solid var(--interactive-accent)" },
						".cm-content": {
							padding: "4px 8px",
							fontFamily: "var(--font-text)",
							color: "var(--text-normal)",
							caretColor: "var(--text-normal)",
						},
						".cm-line": { lineHeight: "1.6" },
						".cm-cursor": { borderLeftColor: "var(--text-normal)" },
						".cm-selectionBackground": { backgroundColor: "var(--text-selection) !important" },
						".cm-gutters": { display: "none" },
					}),
					EditorView.lineWrapping,
				],
			}),
			parent: el,
		})
		view.focus()
		return () => { view.destroy() }
	}, [editing]) // eslint-disable-line react-hooks/exhaustive-deps

	// Render markdown preview when not editing
	useEffect(() => {
		if (editing || !previewRef.current || !props.value) return
		const el = previewRef.current
		el.replaceChildren()
		const component = new Component()
		component.load()
		MarkdownRenderer.render(props.plugin.app, props.value, el, props.sourcePath, component)
		return () => { component.unload() }
	}, [editing, props.value, props.sourcePath, props.plugin.app])

	// Empty placeholder
	if (!editing && !props.value) {
		return (
			<div
				className="mt-2 w-full text-xs px-2 py-1 rounded cursor-text text-[color:--text-faint] hover:bg-[--background-modifier-hover] transition-colors"
				onClick={() => setEditing(true)}
			>
				Add a note...
			</div>
		)
	}

	// Edit mode — CM6 editor
	if (editing) {
		return (
			<div
				ref={containerRef}
				className="mt-2 w-full rounded border border-[--interactive-accent] overflow-hidden"
			/>
		)
	}

	// Preview mode — rendered markdown
	return (
		<div
			ref={previewRef}
			className="mt-2 w-full text-xs px-2 py-1 rounded cursor-text hover:bg-[--background-modifier-hover] transition-colors markdown-rendered [&_p]:m-0 [&_p:not(:last-child)]:mb-1"
			onClick={() => setEditing(true)}
			title="Click to edit"
		/>
	)
}
