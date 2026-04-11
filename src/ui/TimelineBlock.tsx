import {useRef, useState, useEffect, useMemo} from "react";
import {useStore} from "zustand";
import type {StoreApi} from "zustand";
import HistoricaPlugin from "@/main";
import type {TimelineStore} from "@/src/store/createTimelineStore";
import {TimelineI} from "@/src/ui/TimelineI";
import {TimelineToolbar} from "@/src/ui/TimelineToolbar";
import {TimelineContextMenu} from "@/src/ui/TimelineContextMenu";
import {TimelineEmptyState} from "@/src/ui/TimelineEmptyState";
import HeaderAndFooterEditor from "@/src/ui/HeaderAndFooterEditor";
import {TimelineProvider} from "@/src/ui/TimelineContext";

export function TimelineBlock(props: {
	store: StoreApi<TimelineStore>;
	plugin: HistoricaPlugin;
}) {
	const {store, plugin} = props;

	const units = useStore(store, s => s.units);
	const settings = useStore(store, s => s.settings);
	const isLoading = useStore(store, s => s.isLoading);
	const isParsing = useStore(store, s => s.isParsing);
	const error = useStore(store, s => s.error);
	const editHeaderOrFooter = useStore(store, s => s.editHeaderOrFooter);

	const timelineRef = useRef<HTMLDivElement | null>(null);
	const [isShowHeaderEditor, setIsShowHeaderEditor] = useState(false);
	const [isShowFooterEditor, setIsShowFooterEditor] = useState(false);

	useEffect(() => {
		store.getState().load();
	}, []);

	const contextValue = useMemo(() => ({store, plugin}), [store, plugin]);

	if (isLoading) {
		return <div className="twp p-4">Loading timeline...</div>;
	}

	if (error) {
		return <div className="twp p-4 text-red-500">Error: {error}</div>;
	}

	return (
		<TimelineProvider value={contextValue}>
			<div className="twp">
				<TimelineToolbar timelineRef={timelineRef} />
				<TimelineContextMenu
					timelineRef={timelineRef}
					onShowHeaderEditor={() => setIsShowHeaderEditor(true)}
					onShowFooterEditor={() => setIsShowFooterEditor(true)}
				>
					<div className="relative min-h-full p-4 overflow-y-auto resize-y" style={{maxHeight: "70vh"}}>
						{isParsing && (
							<div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--background-primary)]/80">
								<div className="flex items-center gap-2 text-[var(--text-muted)]">
									<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
									</svg>
									Parsing...
								</div>
							</div>
						)}
						{units.length > 0 ? (
							<div className="p-4">
								{isShowHeaderEditor && (
									<HeaderAndFooterEditor
										setIsShow={setIsShowHeaderEditor}
										plugin={plugin}
										handleEdit={editHeaderOrFooter}
										content={settings.header}
										type="header"
									/>
								)}
								<TimelineI
									timelineRef={timelineRef}
									isDisplayFooter={!isShowFooterEditor}
									isDisplayHeader={!isShowHeaderEditor}
								/>
								{isShowFooterEditor && (
									<HeaderAndFooterEditor
										setIsShow={setIsShowFooterEditor}
										plugin={plugin}
										handleEdit={editHeaderOrFooter}
										content={settings.footer}
										type="footer"
									/>
								)}
							</div>
						) : (
							<TimelineEmptyState />
						)}
					</div>
				</TimelineContextMenu>
			</div>
		</TimelineProvider>
	);
}
