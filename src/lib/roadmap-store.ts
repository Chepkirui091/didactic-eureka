/**
 * In-memory store for roadmap progress (demo / offline fallback).
 */

import type {
  EntryStatus,
  RoadmapDayProgress,
  RoadmapOverview,
  RoadmapSummary,
  TimeBlockId,
} from "./types";
import {
  createEmptyDayProgress,
  computeRoadmapStats,
  isDayUnlocked,
  getDayLockMessage,
  getFirstIncompleteDay,
  computeRoadmapStreaks,
  isDayFullyComplete,
  definitionToSummary,
  type RoadmapDefinition,
} from "./roadmap-core";
import { ROADMAP_DEFINITIONS, requireRoadmapDefinition, getRoadmapDefinition } from "./roadmap-registry";

type StoreState = {
  progressMap: Map<number, RoadmapDayProgress>;
  activityByDate: Map<string, number>;
  startedAt: string | null;
};

const stores = new Map<string, StoreState>();

function getStore(roadmapId: string): StoreState {
  let store = stores.get(roadmapId);
  if (!store) {
    store = {
      progressMap: new Map(),
      activityByDate: new Map(),
      startedAt: null,
    };
    stores.set(roadmapId, store);
  }
  return store;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function activityRecord(store: StoreState): Record<string, number> {
  return Object.fromEntries(store.activityByDate);
}

function adjustActivity(store: StoreState, date: string, delta: number): void {
  const next = (store.activityByDate.get(date) ?? 0) + delta;
  if (next <= 0) store.activityByDate.delete(date);
  else store.activityByDate.set(date, next);
}

function ensureDay(def: RoadmapDefinition, dayNumber: number): RoadmapDayProgress {
  const store = getStore(def.id);
  let p = store.progressMap.get(dayNumber);
  if (!p) {
    p = createEmptyDayProgress(dayNumber, def.timeBlocks);
    store.progressMap.set(dayNumber, p);
  }
  if (!p.taskStatuses) p.taskStatuses = {};
  return p;
}

function getAllProgress(def: RoadmapDefinition): RoadmapDayProgress[] {
  return def.days.map((d) => ensureDay(def, d.dayNumber));
}

export function listRoadmapSummaries(): RoadmapSummary[] {
  return ROADMAP_DEFINITIONS.map((def) => {
    const overview = getRoadmapOverview(def.id);
    return definitionToSummary(def, overview);
  });
}

export function checkDayAccess(
  roadmapId: string,
  dayNumber: number,
): {
  allowed: boolean;
  message: string | null;
  requiredDay: number | null;
} {
  const def = requireRoadmapDefinition(roadmapId);
  const progress = getAllProgress(def);
  if (!isDayUnlocked(dayNumber, progress, def.days.length)) {
    for (let d = 1; d < dayNumber; d++) {
      const p = progress.find((x) => x.dayNumber === d);
      if (!p?.dayCompleted) {
        return {
          allowed: false,
          message: getDayLockMessage(dayNumber, progress, def.days.length),
          requiredDay: d,
        };
      }
    }
  }
  return { allowed: true, message: null, requiredDay: null };
}

export function getRoadmapOverview(roadmapId: string): RoadmapOverview {
  const def = requireRoadmapDefinition(roadmapId);
  const store = getStore(def.id);
  const progress = getAllProgress(def);
  const activity = activityRecord(store);
  return {
    id: def.id,
    title: def.title,
    description: def.description,
    totalDays: def.days.length,
    startedAt: store.startedAt,
    currentDay: getFirstIncompleteDay(progress, def.days.length),
    days: def.days,
    timeBlocks: def.timeBlocks,
    weekGoals: def.weekGoals,
    accent: def.accent,
    tags: def.tags,
    progress,
    stats: computeRoadmapStats(def.days, progress, def.timeBlocks),
    streaks: computeRoadmapStreaks(progress, activity, def.days.length),
    activityByDate: activity,
  };
}

export function startRoadmap(roadmapId: string): RoadmapOverview {
  const def = requireRoadmapDefinition(roadmapId);
  const store = getStore(def.id);
  if (!store.startedAt) store.startedAt = new Date().toISOString();
  ensureDay(def, 1);
  return getRoadmapOverview(def.id);
}

export function updateBlockStatus(
  roadmapId: string,
  dayNumber: number,
  blockId: TimeBlockId,
  status: EntryStatus,
): RoadmapDayProgress | null {
  const def = getRoadmapDefinition(roadmapId);
  if (!def || dayNumber < 1 || dayNumber > def.days.length) return null;
  const store = getStore(def.id);
  if (!store.startedAt) store.startedAt = new Date().toISOString();

  const p = ensureDay(def, dayNumber);
  const prev = p.blocks[blockId];
  p.blocks = { ...p.blocks, [blockId]: status };
  p.updatedAt = new Date().toISOString();

  const date = today();
  if (prev !== "completed" && status === "completed") adjustActivity(store, date, 1);
  if (prev === "completed" && status !== "completed") adjustActivity(store, date, -1);

  const day = def.days.find((d) => d.dayNumber === dayNumber);
  p.dayCompleted = isDayFullyComplete(day, p, def.timeBlocks);
  p.completedAt = p.dayCompleted ? date : null;
  return p;
}

export function updateTaskStatus(
  roadmapId: string,
  dayNumber: number,
  taskId: string,
  status: EntryStatus,
): RoadmapDayProgress | null {
  const def = getRoadmapDefinition(roadmapId);
  if (!def || dayNumber < 1 || dayNumber > def.days.length) return null;
  const store = getStore(def.id);
  if (!store.startedAt) store.startedAt = new Date().toISOString();

  const p = ensureDay(def, dayNumber);
  const prev = p.taskStatuses[taskId] ?? "pending";
  p.taskStatuses = { ...p.taskStatuses, [taskId]: status };
  p.updatedAt = new Date().toISOString();

  const date = today();
  if (prev !== "completed" && status === "completed") adjustActivity(store, date, 1);
  if (prev === "completed" && status !== "completed") adjustActivity(store, date, -1);

  const day = def.days.find((d) => d.dayNumber === dayNumber);
  p.dayCompleted = isDayFullyComplete(day, p, def.timeBlocks);
  p.completedAt = p.dayCompleted ? date : null;
  return p;
}

export function updateDayNotes(
  roadmapId: string,
  dayNumber: number,
  data: { notes?: string; builtItems?: string; learnNotes?: string },
): RoadmapDayProgress | null {
  const def = getRoadmapDefinition(roadmapId);
  if (!def || dayNumber < 1 || dayNumber > def.days.length) return null;
  const p = ensureDay(def, dayNumber);
  if (data.notes !== undefined) p.notes = data.notes;
  if (data.builtItems !== undefined) p.builtItems = data.builtItems;
  if (data.learnNotes !== undefined) p.learnNotes = data.learnNotes;
  p.updatedAt = new Date().toISOString();
  return p;
}

export function getDayProgress(
  roadmapId: string,
  dayNumber: number,
): RoadmapDayProgress | null {
  const def = getRoadmapDefinition(roadmapId);
  if (!def || dayNumber < 1 || dayNumber > def.days.length) return null;
  return ensureDay(def, dayNumber);
}
