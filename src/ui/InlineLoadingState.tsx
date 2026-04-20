import {Spinner} from "./Spinner";

export function InlineLoadingState({message = "Loading\u2026", size = 16}: {
	message?: string;
	size?: number;
}) {
	return (
		<div style={{
			flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
			gap: 8, fontSize: 13, color: "var(--text-muted)",
		}}>
			<Spinner size={size}/>
			<span>{message}</span>
		</div>
	);
}
