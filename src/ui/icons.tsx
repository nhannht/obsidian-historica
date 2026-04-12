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
