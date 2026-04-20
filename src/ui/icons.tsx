import React, {SVGProps} from "react"

type IconProps = SVGProps<SVGSVGElement>

const defaults: IconProps = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": true,
}

const Icon = ({children, ...props}: IconProps & {children: React.ReactNode}) => (
	<svg {...defaults} {...props}>{children}</svg>
)

export const Check = (props: IconProps) => (
	<Icon {...props}><path d="M20 6 9 17l-5-5"/></Icon>
)

export const ChevronDown = (props: IconProps) => (
	<Icon {...props}><path d="m6 9 6 6 6-6"/></Icon>
)

export const ChevronUp = (props: IconProps) => (
	<Icon {...props}><path d="m18 15-6-6-6 6"/></Icon>
)

export const ChevronsUpDown = (props: IconProps) => (
	<Icon {...props}><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></Icon>
)

export const ChevronRight = (props: IconProps) => (
	<Icon {...props}><path d="m9 18 6-6-6-6"/></Icon>
)

export const Circle = (props: IconProps) => (
	<Icon {...props}><circle cx="12" cy="12" r="10"/></Icon>
)

export const Search = (props: IconProps) => (
	<Icon {...props}><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></Icon>
)

export const Trash2 = (props: IconProps) => (
	<Icon {...props}>
		<path d="M10 11v6"/><path d="M14 11v6"/>
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
		<path d="M3 6h18"/>
		<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
	</Icon>
)

export const GripVertical = (props: IconProps) => (
	<Icon {...props}>
		<circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
		<circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
	</Icon>
)

export const X = (props: IconProps) => (
	<Icon {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></Icon>
)

export const ExternalLink = (props: IconProps) => (
	<Icon {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></Icon>
)

export const Refresh = (props: IconProps) => (
	<Icon {...props}><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></Icon>
)

/* ── Small toolbar icons (12×12 viewBox) ── */

const SmallIcon = ({children, ...props}: IconProps & {children: React.ReactNode}) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden {...props}>{children}</svg>
)

export const SmallCheck = (props: IconProps) => (
	<SmallIcon strokeWidth={2.5} {...props}><polyline points="1,6 4,9 11,2"/></SmallIcon>
)

export const SmallExport = (props: IconProps) => (
	<SmallIcon strokeWidth={1.8} {...props}><path d="M2 9h8M6 2v5M3 5l3 3 3-3"/></SmallIcon>
)

export const SmallSave = (props: IconProps) => (
	<SmallIcon strokeWidth={1.8} {...props}><path d="M2 2h7l1 1v7H2z"/><path d="M4 2v3h4V2"/><rect x="3" y="7" width="6" height="3" rx="0.5"/></SmallIcon>
)

export const SmallChevronDown = (props: IconProps) => (
	<SmallIcon strokeWidth={2} {...props}><path d="M2 4L6 8L10 4"/></SmallIcon>
)
