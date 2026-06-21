import {Section} from "./helpers";

export function ColorTokens() {
	const groups = [
		{
			label: "surface",
			tokens: ["--int-surface", "--int-surface-secondary", "--int-border"],
		},
		{
			label: "text",
			tokens: ["--int-on-surface", "--int-on-surface-muted", "--int-on-surface-faint", "--int-accent-strong"],
		},
		{
			label: "accent",
			tokens: ["--int-primary", "--int-accent-strong", "--int-accent-tint"],
		},
		{
			label: "anchor",
			tokens: ["--int-anchor", "--int-anchor-text", "--int-anchor-tint"],
		},
		{
			label: "danger",
			tokens: ["--int-danger"],
		},
	];
	return (
		<Section id="color-tokens" title="Color Tokens">
			<div style={{
				background: "var(--int-surface-secondary)",
				border: "1px solid var(--int-border)",
				borderRadius: 5, padding: 20,
				display: "flex", flexDirection: "column", gap: 16,
			}}>
				{groups.map(({label, tokens}) => (
					<div key={label}>
						<div style={{fontSize: 9, fontFamily: "var(--int-font-mono)", color: "var(--int-on-surface-faint)", letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase"}}>{label}</div>
						<div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
							{tokens.map(token => (
								<div key={token} style={{display: "flex", alignItems: "center", gap: 7}}>
									<div style={{
										width: 24, height: 24, borderRadius: 4,
										background: `var(${token})`,
										border: "1px solid var(--int-border)",
										flexShrink: 0,
									}}/>
									<span style={{fontFamily: "var(--int-font-mono)", fontSize: 9, color: "var(--int-on-surface-faint)"}}>{token}</span>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</Section>
	);
}
