"use client";

import { useCallback } from "react";
import type { EntryStatus, RoadmapDayProgress, RoadmapOverview, TimeBlockId } from "@/lib/types";
import {
  buildRoadmapOverview,
  loadRoadmapState,
  startRoadmapInStorage,
  updateBlockInStorage,
  updateDayNotesInStorage,
} from "@/lib/roadmap-persistence";
import { isDayUnlocked, getDayLockMessage } from "@/lib/nestjs-roadmap-data";
import { celebrateCompletion, celebrateDayComplete } from "@/components/celebration";
import { isFallbackResponse, readApiError } from "@/lib/api-response";
import { toastError, toastSavedToDb } from "@/lib/toast-messages";
import {
  getRoadmap,
  refetchRoadmapAfterMutation,
} from "@/lib/data-api";
import { CacheKeys, writeCache } from "@/lib/client-cache";
import { useCachedData } from "@/hooks/use-cached-data";

export function useRoadmap() {
  const fetcher = useCallback((force: boolean) => getRoadmap(force), []);
  const { data: roadmap, loading, setData, refresh } = useCachedData<RoadmapOverview>(
    CacheKeys.roadmap,
    fetcher,
  );

  const startRoadmap = useCallback(async () => {
    const res = await fetch("/api/roadmap", { method: "POST" });
    if (res.ok && !isFallbackResponse(res)) {
      const overview = (await res.json()) as RoadmapOverview;
      writeCache(CacheKeys.roadmap, overview, "database");
      setData(overview);
      toastSavedToDb("Roadmap started");
      return;
    }
    const local = startRoadmapInStorage();
    setData(local);
    writeCache(CacheKeys.roadmap, local, "local");
  }, [setData]);

  const updateBlock = useCallback(
    async (dayNumber: number, blockId: TimeBlockId, status: EntryStatus) => {
      const { dayJustCompleted } = updateBlockInStorage(dayNumber, blockId, status);
      const localOverview = buildRoadmapOverview(loadRoadmapState());
      setData(localOverview);
      writeCache(CacheKeys.roadmap, localOverview, "local");

      const res = await fetch(`/api/roadmap/days/${dayNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, status }),
      });

      if (res.ok) {
        if (!isFallbackResponse(res)) {
          toastSavedToDb("Progress saved");
          const overview = await refetchRoadmapAfterMutation();
          setData(overview);
        }
      } else {
        toastError(await readApiError(res));
      }

      if (status === "completed") {
        celebrateCompletion();
        if (dayJustCompleted) celebrateDayComplete();
      }
    },
    [setData],
  );

  const saveDayNotes = useCallback(
    async (
      dayNumber: number,
      data: { notes: string; builtItems: string; learnNotes: string },
    ): Promise<RoadmapDayProgress | null> => {
      updateDayNotesInStorage(dayNumber, data);
      const localOverview = buildRoadmapOverview(loadRoadmapState());
      setData(localOverview);
      writeCache(CacheKeys.roadmap, localOverview, "local");

      const res = await fetch(`/api/roadmap/days/${dayNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const progress = (await res.json()) as RoadmapDayProgress;
        if (!isFallbackResponse(res)) {
          toastSavedToDb("Notes saved to database");
          const overview = await refetchRoadmapAfterMutation();
          setData(overview);
        }
        return progress;
      }

      toastError(await readApiError(res));
      return localOverview.progress.find((p) => p.dayNumber === dayNumber) ?? null;
    },
    [setData],
  );

  const checkDayAccess = useCallback(
    (dayNumber: number) => {
      if (!roadmap) return { allowed: true, message: null, requiredDay: null };
      if (isDayUnlocked(dayNumber, roadmap.progress)) {
        return { allowed: true, message: null, requiredDay: null };
      }
      for (let d = 1; d < dayNumber; d++) {
        const p = roadmap.progress.find((x) => x.dayNumber === d);
        if (!p?.dayCompleted) {
          return {
            allowed: false,
            message: getDayLockMessage(dayNumber, roadmap.progress),
            requiredDay: d,
          };
        }
      }
      return { allowed: false, message: "This day is locked.", requiredDay: dayNumber - 1 };
    },
    [roadmap],
  );

  const getDayProgress = useCallback(
    (dayNumber: number) =>
      roadmap?.progress.find((p) => p.dayNumber === dayNumber) ?? null,
    [roadmap],
  );

  return {
    roadmap,
    loading,
    refresh,
    startRoadmap,
    updateBlock,
    saveDayNotes,
    checkDayAccess,
    getDayProgress,
  };
}
