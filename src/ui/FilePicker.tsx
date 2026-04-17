import {ReactNode, useMemo, useState} from "react";

interface FilePickerProps<T extends { path: string }> {
	files: T[];
	placeholder?: string;
	emptyText?: string;
	onSelect: (value: string) => void;
	className?: string;
	autoFocus?: boolean;
	renderItem?: (file: T) => ReactNode;
}

export function FilePicker<T extends { path: string }>({
	files,
	placeholder = "Search...",
	emptyText = "No files found",
	onSelect,
	className,
	autoFocus,
	renderItem,
}: FilePickerProps<T>) {
	const [query, setQuery] = useState("");

	const filtered = useMemo(
		() => files.filter(f => f.path.toLowerCase().includes(query.toLowerCase())),
		[files, query]
	);

	return (
		<div style={{minWidth: 240}} className={className}>
			<div style={{borderBottom: "1px solid var(--background-modifier-border)"}}>
				<input
					autoFocus={autoFocus}
					value={query}
					onChange={e => setQuery(e.target.value)}
					placeholder={placeholder}
					style={{
						width: "100%", boxSizing: "border-box",
						padding: "8px 12px", fontSize: 13,
						background: "transparent", border: "none", outline: "none",
						color: "var(--text-normal)",
					}}
				/>
			</div>
			<div style={{maxHeight: 260, overflowY: "auto"}}>
				{filtered.length === 0 ? (
					<div style={{padding: "8px 12px", fontSize: 12, color: "var(--text-faint)"}}>
						{emptyText}
					</div>
				) : filtered.map(f => (
					<div
						key={f.path}
						onMouseDown={() => onSelect(f.path)}
						onMouseEnter={e => (e.currentTarget.style.background = "var(--background-secondary)")}
						onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
						style={{
							display: "flex", alignItems: "center", gap: 6,
							padding: "7px 12px", fontSize: 13, cursor: "pointer",
							background: "transparent",
							color: "var(--text-normal)",
						}}
					>
						{renderItem ? renderItem(f) : f.path}
					</div>
				))}
			</div>
		</div>
	);
}
