import type { Habit, HabitEntry, RoadmapOverview } from "./types";
import { isFallbackResponse, readApiError } from "./api-response";
import {
  CacheKeys,
  invalidateByPrefix,
  invalidateHabitRelatedCaches,
  invalidateRoadmapCache,
  readCache,
  writeCache,
  type CacheSource,
} from "./client-cache";
import { dummyHabits, getTodaysEntries, dummyToday } from "./dummy-data";
import { mergeApiEntriesWithStorage } from "./entries-persistence";
import {
  buildRoadmapOverview,
  loadRoadmapState,
  saveRoadmapFromOverview,
} from "./roadmap-persistence";

function sourceFromResponse(res: Response): CacheSource {
  return isFallbackResponse(res) ? "fallback" : "database";
}

export async function getHabits(force = false): Promise<Habit[]> {
  const key = CacheKeys.habits;
  if (!force) {
    const cached = readCache<Habit[]>(key);
    if (cached) return cached.data;
  }

  try {
    const res = await fetch("/api/habits");
    if (res.ok) {
      const data = (await res.json()) as Habit[];
      const habits = Array.isArray(data) ? data : dummyHabits;
      writeCache(key, habits, sourceFromResponse(res));
      return habits;
    }
  } catch {
    // fall through
  }
  writeCache(key, dummyHabits, "local");
  return dummyHabits;
}

export async function getHabitById(id: string, force = false): Promise<Habit | null> {
  const key = CacheKeys.habit(id);
  if (!force) {
    const cached = readCache<Habit>(key);
    if (cached) return cached.data;
  }

  const habits = await getHabits(force);
  const fromList = habits.find((h) => h.id === id);
  if (fromList && !force) {
    writeCache(key, fromList, readCache<Habit[]>(CacheKeys.habits)?.source ?? "local");
    return fromList;
  }

  try {
    const res = await fetch(`/api/habits/${id}`);
    if (res.ok) {
      const habit = (await res.json()) as Habit;
      writeCache(key, habit, sourceFromResponse(res));
      return habit;
    }
  } catch {
    // fall through
  }
  return null;
}

export async function getEntriesToday(force = false): Promise<HabitEntry[]> {
  const key = CacheKeys.entriesToday;
  if (!force) {
    const cached = readCache<HabitEntry[]>(key);
    if (cached) return cached.data;
  }

  try {
    const res = await fetch("/api/entries?date=today");
    if (res.ok) {
      const data = (await res.json()) as HabitEntry[];
      if (Array.isArray(data)) {
        const entries = isFallbackResponse(res)
          ? mergeApiEntriesWithStorage(data, dummyToday)
          : data;
        writeCache(key, entries, sourceFromResponse(res));
        return entries;
      }
    }
  } catch {
    // fall through
  }
  const fallback = mergeApiEntriesWithStorage(getTodaysEntries(), dummyToday);
  writeCache(key, fallback, "local");
  return fallback;
}

export async function getEntriesDaysBack(days: number, force = false): Promise<HabitEntry[]> {
  const key = CacheKeys.entriesDays(days);
  if (!force) {
    const cached = readCache<HabitEntry[]>(key);
    if (cached) return cached.data;
  }

  try {
    const res = await fetch(`/api/entries?daysBack=${days}`);
    if (res.ok) {
      const data = (await res.json()) as HabitEntry[];
      const entries = Array.isArray(data) ? data : [];
      writeCache(key, entries, sourceFromResponse(res));
      return entries;
    }
  } catch {
    // fall through
  }
  return [];
}

export async function getEntriesForHabit(
  habitId: string,
  force = false,
): Promise<HabitEntry[]> {
  const key = CacheKeys.entriesHabit(habitId);
  if (!force) {
    const cached = readCache<HabitEntry[]>(key);
    if (cached) return cached.data;
  }

  try {
    const res = await fetch(`/api/entries?habitId=${habitId}`);
    if (res.ok) {
      const data = (await res.json()) as HabitEntry[];
      const entries = Array.isArray(data) ? data : [];
      writeCache(key, entries, sourceFromResponse(res));
      return entries;
    }
  } catch {
    // fall through
  }
  return [];
}

export async function getActivityByDate(
  days: number,
  force = false,
): Promise<Record<string, number>> {
  const key = CacheKeys.activity(days);
  if (!force) {
    const cached = readCache<Record<string, number>>(key);
    if (cached) return cached.data;
  }

  try {
    const res = await fetch(`/api/entries?activity=${days}`);
    if (res.ok) {
      const data = (await res.json()) as Record<string, number>;
      writeCache(key, data ?? {}, sourceFromResponse(res));
      return data ?? {};
    }
  } catch {
    // fall through
  }
  return {};
}

export async function getRoadmap(force = false): Promise<RoadmapOverview> {
  const key = CacheKeys.roadmap;
  if (!force) {
    const cached = readCache<RoadmapOverview>(key);
    if (cached) return cached.data;
    const local = buildRoadmapOverview(loadRoadmapState());
    if (local.progress.some((p) => p.dayCompleted || Object.values(p.blocks).some((s) => s !== "pending"))) {
      writeCache(key, local, "local");
      return local;
    }
  }

  try {
    const res = await fetch("/api/roadmap");
    if (res.ok) {
      const overview = (await res.json()) as RoadmapOverview;
      if (isFallbackResponse(res)) {
        const local = buildRoadmapOverview(loadRoadmapState());
        writeCache(key, local, "fallback");
        return local;
      }
      saveRoadmapFromOverview(overview);
      writeCache(key, overview, "database");
      return overview;
    }
  } catch {
    // fall through
  }
  const local = buildRoadmapOverview(loadRoadmapState());
  writeCache(key, local, "local");
  return local;
}

/** Patch today's entry in cache after marking done — no refetch. */
export function patchTodayEntry(habitId: string, entry: HabitEntry): void {
  const key = CacheKeys.entriesToday;
  const cached = readCache<HabitEntry[]>(key);
  const base = cached?.data ?? [];
  const byHabit = new Map(base.map((e) => [e.habitId, e]));
  byHabit.set(habitId, entry);
  writeCache(key, [...byHabit.values()], cached?.source ?? "local");
  invalidateByPrefix("entries:days:");
  invalidateByPrefix("activity:");
}

export { invalidateHabitRelatedCaches, invalidateRoadmapCache };

export async function refetchHabitsAfterMutation(): Promise<Habit[]> {
  invalidateHabitRelatedCaches();
  return getHabits(true);
}

export async function refetchRoadmapAfterMutation(): Promise<RoadmapOverview> {
  invalidateRoadmapCache();
  return getRoadmap(true);
}

export { readApiError };
