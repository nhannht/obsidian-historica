export function SourceFilePill({path, onClick}: {
	path: string;
	onClick?: () => void;
}) {
	const filename = path.split("/").pop() ?? path;
	return (
		<span
			title={path}
			onClick={onClick}
			className={onClick
				? "historica-source-pill historica-source-pill-clickable"
				: "historica-source-pill"}
		>
			{filename}
		</span>
	);
}
