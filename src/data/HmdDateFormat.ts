export function formatHmdDate(value: string, style: string): string {
	if (style === "free" || !value) return value || "Unknown date";
	if (/^-?\d+$/.test(value)) {
		const ms = parseInt(value, 10);
		const date = new Date(ms);
		if (!isNaN(date.getTime())) {
			return date.toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		}
	}
	return value;
}
