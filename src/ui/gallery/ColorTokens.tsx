import {Section} from "./helpers";

export function ColorTokens() {
	const groups = [
		{
			label: "surface",
			tokens: ["--background-primary", "--background-secondary", "--background-modifier-border", "--background-modifier-hover"],
		},
		{
			label: "text",
			tokens: ["--text-normal", "--text-muted", "--text-faint", "--text-accent"],
		},
		{
			label: "accent",
			tokens: ["--interactive-accent"],
		},
	];
	return (
		<Section id="color-tokens" title="Color Tokens">
			<div style={{
				background: "var(--background-secondary)",
				border: "1px solid var(--background-modifier-border)",
				borderRadius: 5, padding: 20,
				display: "flex", flexDirection: "column", gap: 16,
			}}>
				{groups.map(({label, tokens}) => (
					<div key={label}>
						<div style={{fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)", letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase"}}>{label}</div>
						<div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
							{tokens.map(token => (
								<div key={token} style={{display: "flex", alignItems: "center", gap: 7}}>
									<div style={{
										width: 24, height: 24, borderRadius: 4,
										background: `var(${token})`,
										border: "1px solid var(--background-modifier-border)",
										flexShrink: 0,
									}}/>
									<span style={{fontFamily: "monospace", fontSize: 9, color: "var(--text-faint)"}}>{token}</span>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</Section>
	);
}
