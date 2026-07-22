/**
 * Legacy localStorage helpers for a single roadmap.
 * Prefer API + in-memory/DB stores; kept for offline merge compatibility.
 */

import type { EntryStatus, RoadmapDayProgress, RoadmapOverview, TimeBlockId } from "./types";
import {
  ROADMAP_ID,
  ROADMAP_TITLE,
  ROADMAP_DESCRIPTION,
  ROADMAP_DAYS,
  TIME_BLOCKS,
  createEmptyDayProgress,
  computeRoadmapStats,
  getFirstIncompleteDay,
  computeRoadmapStreaks,
} from "./nestjs-roadmap-data";

const STORAGE_KEY = "habitflow:roadmap";

export interface RoadmapPersistedState {
  startedAt: string | null;
  progress: RoadmapDayProgress[];
  activityByDate: Record<string, number>;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultState(): RoadmapPersistedState {
  return {
    startedAt: null,
    progress: ROADMAP_DAYS.map((d) => createEmptyDayProgress(d.dayNumber)),
    activityByDate: {},
  };
}

function normalizeProgress(p: RoadmapDayProgress): RoadmapDayProgress {
  return {
    ...p,
    taskStatuses: p.taskStatuses ?? {},
  };
}

export function loadRoadmapState(): RoadmapPersistedState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as RoadmapPersistedState;
    const byDay = new Map(
      (parsed.progress ?? []).map((p) => [p.dayNumber, normalizeProgress(p)]),
    );
    return {
      startedAt: parsed.startedAt ?? null,
      progress: ROADMAP_DAYS.map(
        (d) => byDay.get(d.dayNumber) ?? createEmptyDayProgress(d.dayNumber),
      ),
      activityByDate: parsed.activityByDate ?? {},
    };
  } catch {
    return defaultState();
  }
}

export function saveRoadmapState(state: RoadmapPersistedState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("roadmap-updated"));
}

function adjustActivity(
  activityByDate: Record<string, number>,
  date: string,
  delta: number,
): Record<string, number> {
  const next = { ...activityByDate };
  const count = (next[date] ?? 0) + delta;
  if (count <= 0) delete next[date];
  else next[date] = count;
  return next;
}

function syncDayCompleted(p: RoadmapDayProgress): RoadmapDayProgress {
  const allDone = TIME_BLOCKS.every((b) => p.blocks[b.id] === "completed");
  const wasDone = p.dayCompleted;
  return {
    ...p,
    taskStatuses: p.taskStatuses ?? {},
    dayCompleted: allDone,
    completedAt: allDone && !wasDone ? today() : allDone ? p.completedAt : null,
  };
}

export function buildRoadmapOverview(state: RoadmapPersistedState): RoadmapOverview {
  return {
    id: ROADMAP_ID,
    title: ROADMAP_TITLE,
    description: ROADMAP_DESCRIPTION,
    totalDays: ROADMAP_DAYS.length,
    startedAt: state.startedAt,
    currentDay: getFirstIncompleteDay(state.progress),
    days: ROADMAP_DAYS,
    timeBlocks: TIME_BLOCKS,
    progress: state.progress.map(normalizeProgress),
    stats: computeRoadmapStats(state.progress),
    streaks: computeRoadmapStreaks(state.progress, state.activityByDate),
    activityByDate: state.activityByDate,
  };
}

export function startRoadmapInStorage(): RoadmapOverview {
  const state = loadRoadmapState();
  if (!state.startedAt) state.startedAt = new Date().toISOString();
  saveRoadmapState(state);
  return buildRoadmapOverview(state);
}

export function updateBlockInStorage(
  dayNumber: number,
  blockId: TimeBlockId,
  status: EntryStatus,
): { state: RoadmapPersistedState; dayJustCompleted: boolean } {
  const state = loadRoadmapState();
  const idx = state.progress.findIndex((p) => p.dayNumber === dayNumber);
  if (idx === -1) return { state, dayJustCompleted: false };

  const p = {
    ...state.progress[idx],
    blocks: { ...state.progress[idx].blocks },
    taskStatuses: { ...(state.progress[idx].taskStatuses ?? {}) },
  };
  const wasCompleted = p.blocks[blockId] === "completed";
  const nowCompleted = status === "completed";
  p.blocks[blockId] = status;
  p.updatedAt = new Date().toISOString();

  let activity = state.activityByDate;
  if (!wasCompleted && nowCompleted) activity = adjustActivity(activity, today(), 1);
  else if (wasCompleted && !nowCompleted) activity = adjustActivity(activity, today(), -1);

  const beforeDayDone = p.dayCompleted;
  const synced = syncDayCompleted(p);
  state.progress[idx] = synced;
  state.activityByDate = activity;
  saveRoadmapState(state);

  return { state, dayJustCompleted: synced.dayCompleted && !beforeDayDone };
}

export function updateDayNotesInStorage(
  dayNumber: number,
  data: { notes?: string; builtItems?: string; learnNotes?: string },
): RoadmapPersistedState {
  const state = loadRoadmapState();
  const idx = state.progress.findIndex((p) => p.dayNumber === dayNumber);
  if (idx === -1) return state;

  const p = { ...state.progress[idx], taskStatuses: { ...(state.progress[idx].taskStatuses ?? {}) } };
  if (data.notes !== undefined) p.notes = data.notes;
  if (data.builtItems !== undefined) p.builtItems = data.builtItems;
  if (data.learnNotes !== undefined) p.learnNotes = data.learnNotes;
  p.updatedAt = new Date().toISOString();
  state.progress[idx] = syncDayCompleted(p);
  saveRoadmapState(state);
  return state;
}

export function mergeRoadmapState(
  local: RoadmapPersistedState,
  apiProgress: RoadmapDayProgress[],
  apiStartedAt: string | null,
  apiActivity: Record<string, number>,
): RoadmapPersistedState {
  const byDay = new Map(local.progress.map((p) => [p.dayNumber, normalizeProgress(p)]));

  for (const apiDay of apiProgress) {
    const existing = byDay.get(apiDay.dayNumber);
    if (!existing || apiDay.updatedAt > existing.updatedAt) {
      byDay.set(apiDay.dayNumber, normalizeProgress(apiDay));
    }
  }

  const activity = { ...local.activityByDate };
  for (const [date, count] of Object.entries(apiActivity)) {
    activity[date] = Math.max(activity[date] ?? 0, count);
  }

  return {
    startedAt: apiStartedAt ?? local.startedAt,
    progress: ROADMAP_DAYS.map(
      (d) => byDay.get(d.dayNumber) ?? createEmptyDayProgress(d.dayNumber),
    ),
    activityByDate: activity,
  };
}

export function saveRoadmapFromOverview(overview: RoadmapOverview): void {
  saveRoadmapState({
    startedAt: overview.startedAt,
    progress: overview.progress.map(normalizeProgress),
    activityByDate: overview.activityByDate,
  });
}
