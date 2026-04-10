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
					<div className="min-h-full p-4 overflow-y-auto resize-y" style={{maxHeight: "70vh"}}>
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
