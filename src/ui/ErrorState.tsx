export function ErrorState({message}: {message: string}) {
	return (
		<div style={{
			flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
			padding: 16, fontSize: 13,
			color: "var(--int-danger)",
		}}>
			Error: {message}
		</div>
	);
}
