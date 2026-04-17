import {NAV_SECTIONS} from "./gallery/constants";
import {TypeScale} from "./gallery/TypeScale";
import {ColorTokens} from "./gallery/ColorTokens";
import {BadgeSection} from "./gallery/BadgeSection";
import {PrecisionBar} from "./gallery/PrecisionBar";
import {SignificanceBars} from "./gallery/SignificanceBars";
import {ContextMenuSection} from "./gallery/ContextMenuSection";
import {FilePickerSection} from "./gallery/FilePickerSection";
import {EntryCard} from "./gallery/EntryCard";
import {CoverageStats} from "./gallery/CoverageStats";
import {UnparsedPanel} from "./gallery/UnparsedPanel";
import {LoadingStates} from "./gallery/LoadingStates";
import {ToolbarSection} from "./gallery/ToolbarSection";
import {BlockTimeline} from "./gallery/BlockTimeline";
import {GlobalTimelineSection} from "./gallery/GlobalTimelineSection";

export function DesignGallery() {
	return (
		<div style={{
			height: "100%", overflowY: "auto",
			background: "var(--background-primary)",
			color: "var(--text-normal)",
			fontFamily: "var(--font-interface)",
		}}>
			<div style={{
				position: "sticky", top: 0, zIndex: 10,
				background: "var(--background-primary)",
				borderBottom: "1px solid var(--background-modifier-border)",
				padding: "8px 24px",
				display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap",
			}}>
				<span style={{
					fontSize: 9, fontFamily: "monospace", color: "var(--text-faint)",
					letterSpacing: "0.1em", marginRight: 12, opacity: 0.6,
				}}>HISTORICA · GALLERY</span>
				{NAV_SECTIONS.map(({id, label}) => (
					<a key={id} href={`#${id}`} style={{
						fontSize: 10, fontFamily: "monospace",
						color: "var(--text-faint)",
						textDecoration: "none", padding: "2px 6px",
						border: "1px solid transparent",
						borderRadius: 3,
					}}
					onMouseEnter={e => {
						e.currentTarget.style.color = "var(--text-accent)";
						e.currentTarget.style.borderColor = "var(--background-modifier-border)";
					}}
					onMouseLeave={e => {
						e.currentTarget.style.color = "var(--text-faint)";
						e.currentTarget.style.borderColor = "transparent";
					}}
					>
						{label}
					</a>
				))}
			</div>

			<div style={{padding: "28px 28px 56px"}}>
				<TypeScale/>
				<ColorTokens/>
				<BadgeSection/>
				<PrecisionBar/>
				<SignificanceBars/>
				<ContextMenuSection/>
				<FilePickerSection/>
				<EntryCard/>
				<CoverageStats/>
				<UnparsedPanel/>
				<LoadingStates/>
				<ToolbarSection/>
				<BlockTimeline/>
				<GlobalTimelineSection/>
			</div>
		</div>
	);
}
