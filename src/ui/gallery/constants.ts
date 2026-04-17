export const SIG_LEVELS = [1, 2, 3, 4, 5] as const;
export const PILL_RADIUS = 9999;
export const BOUNCE_DELAYS = [0, 0.15, 0.3] as const;

export const NAV_SECTIONS = [
	{id: "type-scale",        label: "Type"},
	{id: "color-tokens",      label: "Colors"},
	{id: "badge",             label: "Badge"},
	{id: "precision-bar",     label: "Precision"},
	{id: "significance-bars", label: "Significance"},
	{id: "context-menu",      label: "Menu"},
	{id: "file-picker",       label: "FilePicker"},
	{id: "entry-card",        label: "Entry"},
	{id: "coverage-stats",    label: "Coverage"},
	{id: "unparsed-panel",    label: "Unparsed"},
	{id: "loading-states",    label: "Loading"},
	{id: "toolbar",           label: "Toolbar"},
	{id: "block-timeline",    label: "Block"},
	{id: "global-timeline",   label: "Global"},
];
