import type {ReactNode} from "react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/src/ui/shadcn/Command";

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
	return (
		<Command className={className}>
			<CommandInput placeholder={placeholder} autoFocus={autoFocus} />
			<CommandList>
				<CommandEmpty>{emptyText}</CommandEmpty>
				<CommandGroup>
					{files.map(f => (
						<CommandItem key={f.path} value={f.path} onSelect={onSelect}>
							{renderItem ? renderItem(f) : f.path}
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
