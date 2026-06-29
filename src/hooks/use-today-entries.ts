"use client";

import { useCallback } from "react";
import type { EntryStatus, HabitEntry } from "@/lib/types";
import { dummyToday } from "@/lib/dummy-data";
import { celebrateAllHabitsDone, celebrateCompletion } from "@/components/celebration";
import { isFallbackResponse, readApiError } from "@/lib/api-response";
import { toastError, toastSavedToDb } from "@/lib/toast-messages";
import {
  getEntriesToday,
  patchTodayEntry,
} from "@/lib/data-api";
import { CacheKeys, readCache } from "@/lib/client-cache";
import { useCachedData } from "@/hooks/use-cached-data";

export function useTodayEntries(scheduledHabitIds: string[]) {
  const fetcher = useCallback((force: boolean) => getEntriesToday(force), []);
  const { data, loading, setData } = useCachedData<HabitEntry[]>(
    CacheKeys.entriesToday,
    fetcher,
  );
  const entries = data ?? [];

  const revertToCachedEntries = useCallback(() => {
    const cached = readCache<HabitEntry[]>(CacheKeys.entriesToday);
    if (cached?.source === "database") setData(cached.data);
  }, [setData]);

  const setStatus = useCallback(
    async (habitId: string, status: EntryStatus) => {
      const previous = entries;

      const existing = entries.find((e) => e.habitId === habitId);
      const optimistic: HabitEntry = {
        ...(existing ?? {
          id: `local-${habitId}`,
          habitId,
          date: dummyToday,
          status: "pending" as EntryStatus,
          createdAt: dummyToday,
          updatedAt: dummyToday,
        }),
        status,
        updatedAt: new Date().toISOString(),
      };

      const next = [...entries.filter((e) => e.habitId !== habitId), optimistic];
      setData(next);

      const res = await fetch(`/api/habits/${habitId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, date: dummyToday }),
      });

      if (res.ok && !isFallbackResponse(res)) {
        const saved = (await res.json()) as HabitEntry;
        patchTodayEntry(habitId, saved);
        const next = [...previous.filter((e) => e.habitId !== habitId), saved];
        setData(next);

        toastSavedToDb(
          status === "completed"
            ? "Marked done — saved to database"
            : "Status saved to database",
        );

        if (status === "completed") {
          celebrateCompletion();
          const completed = scheduledHabitIds.filter(
            (id) => next.find((e) => e.habitId === id)?.status === "completed",
          ).length;
          if (scheduledHabitIds.length > 0 && completed === scheduledHabitIds.length) {
            setTimeout(() => celebrateAllHabitsDone(), 350);
          }
        }
        return;
      }

      setData(previous);
      revertToCachedEntries();
      toastError(
        res.ok
          ? "Could not save to database — status reverted"
          : await readApiError(res),
      );
    },
    [entries, scheduledHabitIds, setData, revertToCachedEntries],
  );

  return { entries, loading, setStatus };
}
