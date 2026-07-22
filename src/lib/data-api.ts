import type {
  EntryStatus,
  Habit,
  HabitEntry,
  RoadmapDayProgress,
  RoadmapOverview,
  RoadmapSummary,
  TimeBlockId,
} from "./types";
import { isFallbackResponse, readApiError } from "./api-response";
import {
  CacheKeys,
  invalidateByPrefix,
  invalidateCache,
  invalidateHabitRelatedCaches,
  invalidateRoadmapCache,
  readCache,
  writeCache,
  type CacheSource,
} from "./client-cache";
import { dummyHabits, getTodaysEntries } from "./dummy-data";
import {
  computeRoadmapStats,
  computeRoadmapStreaks,
  getFirstIncompleteDay,
  isDayFullyComplete,
} from "./roadmap-core";

function sourceFromResponse(res: Response): CacheSource {
  return isFallbackResponse(res) ? "fallback" : "database";
}

/** Return DB-backed cache only — ignores legacy local-only entries. */
function readCached<T>(key: string): T | null {
  const entry = readCache<T>(key);
  if (!entry || entry.source !== "database") return null;
  return entry.data;
}

function writeDbCache<T>(key: string, data: T): void {
  writeCache(key, data, "database");
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<{ data: T; res: Response }> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(await readApiError(res));
  }
  const data = (await res.json()) as T;
  return { data, res };
}

export async function getHabits(force = false): Promise<Habit[]> {
  const key = CacheKeys.habits;
  if (!force) {
    const cached = readCached<Habit[]>(key);
    if (cached) return cached;
  }

  try {
    const { data, res } = await fetchJson<Habit[]>("/api/habits");
    const habits = Array.isArray(data) ? data : dummyHabits;
    if (!isFallbackResponse(res)) {
      writeDbCache(key, habits);
    } else {
      writeCache(key, habits, "fallback");
    }
    return habits;
  } catch {
    const stale = readCached<Habit[]>(key);
    if (stale) return stale;
    return dummyHabits;
  }
}

export async function getHabitById(id: string, force = false): Promise<Habit | null> {
  const key = CacheKeys.habit(id);
  if (!force) {
    const cached = readCached<Habit>(key);
    if (cached) return cached;
  }

  const habits = await getHabits(force);
  const fromList = habits.find((h) => h.id === id);
  if (fromList) {
    const source = readCache<Habit[]>(CacheKeys.habits)?.source ?? "database";
    writeCache(key, fromList, source);
    return fromList;
  }

  try {
    const { data, res } = await fetchJson<Habit>(`/api/habits/${id}`);
    if (!isFallbackResponse(res)) {
      writeDbCache(key, data);
    } else {
      writeCache(key, data, "fallback");
    }
    return data;
  } catch {
    return readCached<Habit>(key);
  }
}

export async function getEntriesToday(force = false): Promise<HabitEntry[]> {
  const key = CacheKeys.entriesToday;
  if (!force) {
    const cached = readCached<HabitEntry[]>(key);
    if (cached) return cached;
  }

  try {
    const { data, res } = await fetchJson<HabitEntry[]>("/api/entries?date=today");
    if (Array.isArray(data)) {
      if (!isFallbackResponse(res)) {
        writeDbCache(key, data);
      } else {
        writeCache(key, data, "fallback");
      }
      return data;
    }
  } catch {
    // fall through
  }

  const stale = readCached<HabitEntry[]>(key);
  if (stale) return stale;
  return getTodaysEntries();
}

export async function getEntriesDaysBack(days: number, force = false): Promise<HabitEntry[]> {
  const key = CacheKeys.entriesDays(days);
  if (!force) {
    const cached = readCached<HabitEntry[]>(key);
    if (cached) return cached;
  }

  try {
    const { data, res } = await fetchJson<HabitEntry[]>(`/api/entries?daysBack=${days}`);
    const entries = Array.isArray(data) ? data : [];
    if (!isFallbackResponse(res)) {
      writeDbCache(key, entries);
    } else {
      writeCache(key, entries, "fallback");
    }
    return entries;
  } catch {
    return readCached<HabitEntry[]>(key) ?? [];
  }
}

export async function getEntriesForHabit(
  habitId: string,
  force = false,
): Promise<HabitEntry[]> {
  const key = CacheKeys.entriesHabit(habitId);
  if (!force) {
    const cached = readCached<HabitEntry[]>(key);
    if (cached) return cached;
  }

  try {
    const { data, res } = await fetchJson<HabitEntry[]>(`/api/entries?habitId=${habitId}`);
    const entries = Array.isArray(data) ? data : [];
    if (!isFallbackResponse(res)) {
      writeDbCache(key, entries);
    } else {
      writeCache(key, entries, "fallback");
    }
    return entries;
  } catch {
    return readCached<HabitEntry[]>(key) ?? [];
  }
}

export async function getActivityByDate(
  days: number,
  force = false,
): Promise<Record<string, number>> {
  const key = CacheKeys.activity(days);
  if (!force) {
    const cached = readCached<Record<string, number>>(key);
    if (cached) return cached;
  }

  try {
    const { data, res } = await fetchJson<Record<string, number>>(
      `/api/entries?activity=${days}`,
    );
    const activity = data ?? {};
    if (!isFallbackResponse(res)) {
      writeDbCache(key, activity);
    } else {
      writeCache(key, activity, "fallback");
    }
    return activity;
  } catch {
    return readCached<Record<string, number>>(key) ?? {};
  }
}

export async function listRoadmaps(force = false): Promise<RoadmapSummary[]> {
  const key = CacheKeys.roadmaps;
  if (!force) {
    const cached = readCached<RoadmapSummary[]>(key);
    if (cached) return cached;
  }

  try {
    const { data, res } = await fetchJson<RoadmapSummary[]>("/api/roadmap");
    if (!isFallbackResponse(res)) {
      writeDbCache(key, data);
    } else {
      writeCache(key, data, "fallback");
    }
    return data;
  } catch {
    const stale = readCached<RoadmapSummary[]>(key);
    if (stale) return stale;
    throw new Error("Could not load projects");
  }
}

export async function getRoadmap(
  roadmapId: string,
  force = false,
): Promise<RoadmapOverview> {
  const key = CacheKeys.roadmapId(roadmapId);
  if (!force) {
    const cached = readCached<RoadmapOverview>(key);
    if (cached) return cached;
  }

  try {
    const { data, res } = await fetchJson<RoadmapOverview>(`/api/roadmap/${roadmapId}`);
    if (!isFallbackResponse(res)) {
      writeDbCache(key, data);
    } else {
      writeCache(key, data, "fallback");
    }
    return data;
  } catch {
    const stale = readCached<RoadmapOverview>(key);
    if (stale) return stale;
    throw new Error("Could not load roadmap");
  }
}

function recomputeOverview(overview: RoadmapOverview, progress: RoadmapDayProgress[]): RoadmapOverview {
  return {
    ...overview,
    progress,
    currentDay: getFirstIncompleteDay(progress, overview.totalDays),
    stats: computeRoadmapStats(overview.days, progress, overview.timeBlocks),
    streaks: computeRoadmapStreaks(progress, overview.activityByDate, overview.totalDays),
  };
}

/** Optimistic UI only — cache is updated after a successful DB mutation. */
export function applyRoadmapBlockUpdate(
  overview: RoadmapOverview,
  dayNumber: number,
  blockId: TimeBlockId,
  status: EntryStatus,
): { overview: RoadmapOverview; dayJustCompleted: boolean } {
  const today = new Date().toISOString().slice(0, 10);
  let dayJustCompleted = false;
  const day = overview.days.find((d) => d.dayNumber === dayNumber);

  const progress = overview.progress.map((p) => {
    if (p.dayNumber !== dayNumber) return p;
    const beforeDone = p.dayCompleted;
    const next: RoadmapDayProgress = {
      ...p,
      blocks: { ...p.blocks, [blockId]: status },
      taskStatuses: p.taskStatuses ?? {},
      updatedAt: new Date().toISOString(),
      dayCompleted: false,
      completedAt: null,
    };
    next.dayCompleted = isDayFullyComplete(day, next, overview.timeBlocks);
    next.completedAt = next.dayCompleted ? today : null;
    if (next.dayCompleted && !beforeDone) dayJustCompleted = true;
    return next;
  });

  return { overview: recomputeOverview(overview, progress), dayJustCompleted };
}

export function applyRoadmapTaskUpdate(
  overview: RoadmapOverview,
  dayNumber: number,
  taskId: string,
  status: EntryStatus,
): { overview: RoadmapOverview; dayJustCompleted: boolean } {
  const today = new Date().toISOString().slice(0, 10);
  let dayJustCompleted = false;
  const day = overview.days.find((d) => d.dayNumber === dayNumber);

  const progress = overview.progress.map((p) => {
    if (p.dayNumber !== dayNumber) return p;
    const beforeDone = p.dayCompleted;
    const next: RoadmapDayProgress = {
      ...p,
      taskStatuses: { ...(p.taskStatuses ?? {}), [taskId]: status },
      updatedAt: new Date().toISOString(),
      dayCompleted: false,
      completedAt: null,
    };
    next.dayCompleted = isDayFullyComplete(day, next, overview.timeBlocks);
    next.completedAt = next.dayCompleted ? today : null;
    if (next.dayCompleted && !beforeDone) dayJustCompleted = true;
    return next;
  });

  return { overview: recomputeOverview(overview, progress), dayJustCompleted };
}

export function applyRoadmapDayNotes(
  overview: RoadmapOverview,
  dayNumber: number,
  data: { notes: string; builtItems: string; learnNotes: string },
): RoadmapOverview {
  const progress = overview.progress.map((p) =>
    p.dayNumber === dayNumber
      ? {
          ...p,
          notes: data.notes,
          builtItems: data.builtItems,
          learnNotes: data.learnNotes,
          updatedAt: new Date().toISOString(),
        }
      : p,
  );
  return { ...overview, progress };
}

/** Update today's entries cache after a successful DB save — no full refetch. */
export function patchTodayEntry(habitId: string, entry: HabitEntry): void {
  const key = CacheKeys.entriesToday;
  const cached = readCache<HabitEntry[]>(key);
  const base = cached?.data ?? [];
  const byHabit = new Map(base.map((e) => [e.habitId, e]));
  byHabit.set(habitId, entry);
  writeDbCache(key, [...byHabit.values()]);
  invalidateByPrefix("entries:days:");
  invalidateByPrefix("activity:");
}

export function cacheRoadmapOverview(overview: RoadmapOverview): void {
  writeDbCache(CacheKeys.roadmapId(overview.id), overview);
}

export { invalidateHabitRelatedCaches, invalidateRoadmapCache };

export async function refetchHabitsAfterMutation(): Promise<Habit[]> {
  invalidateHabitRelatedCaches();
  return getHabits(true);
}

export async function refetchRoadmapAfterMutation(
  roadmapId: string,
): Promise<RoadmapOverview> {
  invalidateRoadmapCache(roadmapId);
  return getRoadmap(roadmapId, true);
}

export async function refetchEntriesTodayAfterMutation(): Promise<HabitEntry[]> {
  invalidateCache(CacheKeys.entriesToday);
  invalidateByPrefix("entries:days:");
  invalidateByPrefix("activity:");
  return getEntriesToday(true);
}

export { readApiError };
