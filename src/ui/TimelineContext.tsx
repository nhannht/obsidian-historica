import {createContext, useContext} from "react";
import {type StoreApi} from "zustand/vanilla";
import {useStore} from "zustand";
import type {TimelineStore} from "@/src/store/createTimelineStore";
import type HistoricaPlugin from "@/main";

interface TimelineContextValue {
	store: StoreApi<TimelineStore>;
	plugin: HistoricaPlugin;
}

const TimelineContext = createContext<TimelineContextValue | null>(null);

export const TimelineProvider = TimelineContext.Provider;

export function useTimeline() {
	const ctx = useContext(TimelineContext);
	if (!ctx) throw new Error("useTimeline must be used within a TimelineProvider");
	return ctx;
}

export function useTimelineStore<T>(selector: (state: TimelineStore) => T): T {
	const {store} = useTimeline();
	return useStore(store, selector);
}
