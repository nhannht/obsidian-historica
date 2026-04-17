import {ReactNode} from "react";

export type MenuSeparator = {type: "separator"};

export type MenuItem = {
	type: "item";
	label: string;
	muted?: boolean;
	disabled?: boolean;
	onClick?: () => void;
	submenu?: MenuNode[];
	submenuContent?: ReactNode;
};

export type MenuNode = MenuItem | MenuSeparator;
