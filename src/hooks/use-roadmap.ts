"use client";

import { useCallback } from "react";
import type { EntryStatus, RoadmapDayProgress, RoadmapOverview, TimeBlockId } from "@/lib/types";
import { isDayUnlocked, getDayLockMessage } from "@/lib/nestjs-roadmap-data";
import { celebrateCompletion, celebrateDayComplete } from "@/components/celebration";
import { isFallbackResponse, readApiError } from "@/lib/api-response";
import { toastError, toastSavedToDb } from "@/lib/toast-messages";
import {
  applyRoadmapBlockUpdate,
  applyRoadmapDayNotes,
  cacheRoadmapOverview,
  getRoadmap,
  refetchRoadmapAfterMutation,
} from "@/lib/data-api";
import { CacheKeys, readCache } from "@/lib/client-cache";
import { useCachedData } from "@/hooks/use-cached-data";

export function useRoadmap() {
  const fetcher = useCallback((force: boolean) => getRoadmap(force), []);
  const { data: roadmap, loading, setData, refresh } = useCachedData<RoadmapOverview>(
    CacheKeys.roadmap,
    fetcher,
  );

  const revertToCachedRoadmap = useCallback(() => {
    const cached = readCache<RoadmapOverview>(CacheKeys.roadmap);
    if (cached?.source === "database") setData(cached.data);
    else void refresh();
  }, [setData, refresh]);

  const startRoadmap = useCallback(async () => {
    const res = await fetch("/api/roadmap", { method: "POST" });
    if (res.ok && !isFallbackResponse(res)) {
      const overview = (await res.json()) as RoadmapOverview;
      cacheRoadmapOverview(overview);
      setData(overview);
      toastSavedToDb("Roadmap started");
      return;
    }
    toastError(
      res.ok
        ? "Could not save to database — try again when the connection is stable"
        : await readApiError(res),
    );
  }, [setData]);

  const updateBlock = useCallback(
    async (dayNumber: number, blockId: TimeBlockId, status: EntryStatus) => {
      if (!roadmap) return;

      const { overview: optimistic, dayJustCompleted } = applyRoadmapBlockUpdate(
        roadmap,
        dayNumber,
        blockId,
        status,
      );
      setData(optimistic);

      const res = await fetch(`/api/roadmap/days/${dayNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, status }),
      });

      if (res.ok && !isFallbackResponse(res)) {
        toastSavedToDb("Progress saved");
        const overview = await refetchRoadmapAfterMutation();
        setData(overview);

        if (status === "completed") {
          celebrateCompletion();
          const savedDay = overview.progress.find((p) => p.dayNumber === dayNumber);
          if (savedDay?.dayCompleted && dayJustCompleted) {
            celebrateDayComplete();
          }
        }
        return;
      }

      revertToCachedRoadmap();
      toastError(
        res.ok
          ? "Could not save to database — progress reverted"
          : await readApiError(res),
      );
    },
    [roadmap, setData, revertToCachedRoadmap],
  );

  const saveDayNotes = useCallback(
    async (
      dayNumber: number,
      data: { notes: string; builtItems: string; learnNotes: string },
    ): Promise<RoadmapDayProgress | null> => {
      if (!roadmap) return null;

      setData(applyRoadmapDayNotes(roadmap, dayNumber, data));

      const res = await fetch(`/api/roadmap/days/${dayNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok && !isFallbackResponse(res)) {
        toastSavedToDb("Notes saved to database");
        const overview = await refetchRoadmapAfterMutation();
        setData(overview);
        return overview.progress.find((p) => p.dayNumber === dayNumber) ?? null;
      }

      revertToCachedRoadmap();
      toastError(
        res.ok
          ? "Could not save notes to database — reverted"
          : await readApiError(res),
      );
      return readCache<RoadmapOverview>(CacheKeys.roadmap)?.data.progress.find(
        (p) => p.dayNumber === dayNumber,
      ) ?? null;
    },
    [roadmap, setData, revertToCachedRoadmap],
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
