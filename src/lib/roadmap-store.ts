/**
 * In-memory store for NestJS roadmap progress (demo mode).
 * Replace with Prisma when DATABASE_URL is configured.
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
  isDayUnlocked,
  getDayLockMessage,
  getFirstIncompleteDay,
  computeRoadmapStreaks,
} from "./nestjs-roadmap-data";

const progressMap = new Map<number, RoadmapDayProgress>();
const activityByDate = new Map<string, number>();
let startedAt: string | null = null;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function activityRecord(): Record<string, number> {
  return Object.fromEntries(activityByDate);
}

function adjustActivity(date: string, delta: number): void {
  const next = (activityByDate.get(date) ?? 0) + delta;
  if (next <= 0) activityByDate.delete(date);
  else activityByDate.set(date, next);
}

function ensureDay(dayNumber: number): RoadmapDayProgress {
  let p = progressMap.get(dayNumber);
  if (!p) {
    p = createEmptyDayProgress(dayNumber);
    progressMap.set(dayNumber, p);
  }
  return p;
}

function getAllProgress(): RoadmapDayProgress[] {
  return ROADMAP_DAYS.map((d) => ensureDay(d.dayNumber));
}

function getCurrentDay(): number {
  return getFirstIncompleteDay(getAllProgress());
}

export function checkDayAccess(dayNumber: number): {
  allowed: boolean;
  message: string | null;
  requiredDay: number | null;
} {
  const progress = getAllProgress();
  if (!isDayUnlocked(dayNumber, progress)) {
    for (let d = 1; d < dayNumber; d++) {
      const p = progress.find((x) => x.dayNumber === d);
      if (!p?.dayCompleted) {
        return {
          allowed: false,
          message: getDayLockMessage(dayNumber, progress),
          requiredDay: d,
        };
      }
    }
  }
  return { allowed: true, message: null, requiredDay: null };
}

export function getRoadmapOverview(): RoadmapOverview {
  const progress = getAllProgress();
  const activity = activityRecord();
  return {
    id: ROADMAP_ID,
    title: ROADMAP_TITLE,
    description: ROADMAP_DESCRIPTION,
    totalDays: ROADMAP_DAYS.length,
    startedAt,
    currentDay: getCurrentDay(),
    days: ROADMAP_DAYS,
    timeBlocks: TIME_BLOCKS,
    progress,
    stats: computeRoadmapStats(progress),
    streaks: computeRoadmapStreaks(progress, activity),
    activityByDate: activity,
  };
}

export function getDayProgress(dayNumber: number): RoadmapDayProgress | null {
  if (dayNumber < 1 || dayNumber > 30) return null;
  return ensureDay(dayNumber);
}

export function startRoadmap(): RoadmapOverview {
  if (!startedAt) startedAt = new Date().toISOString();
  return getRoadmapOverview();
}

export function updateBlockStatus(
  dayNumber: number,
  blockId: TimeBlockId,
  status: EntryStatus,
): RoadmapDayProgress | null {
  if (dayNumber < 1 || dayNumber > 30) return null;
  const p = ensureDay(dayNumber);
  const wasCompleted = p.blocks[blockId] === "completed";
  const nowCompleted = status === "completed";
  p.blocks[blockId] = status;
  p.updatedAt = new Date().toISOString();
  if (!wasCompleted && nowCompleted) adjustActivity(today(), 1);
  else if (wasCompleted && !nowCompleted) adjustActivity(today(), -1);
  syncDayCompleted(p);
  return p;
}

export function updateDayNotes(
  dayNumber: number,
  data: {
    notes?: string;
    builtItems?: string;
    learnNotes?: string;
    dayCompleted?: boolean;
  },
): RoadmapDayProgress | null {
  if (dayNumber < 1 || dayNumber > 30) return null;
  const p = ensureDay(dayNumber);
  if (data.notes !== undefined) p.notes = data.notes;
  if (data.builtItems !== undefined) p.builtItems = data.builtItems;
  if (data.learnNotes !== undefined) p.learnNotes = data.learnNotes;
  if (data.dayCompleted !== undefined) p.dayCompleted = data.dayCompleted;
  p.updatedAt = new Date().toISOString();
  if (data.dayCompleted === undefined) syncDayCompleted(p);
  return p;
}

function syncDayCompleted(p: RoadmapDayProgress): void {
  const allDone = TIME_BLOCKS.every((b) => p.blocks[b.id] === "completed");
  const wasDone = p.dayCompleted;
  p.dayCompleted = allDone;
  if (allDone && !wasDone) {
    p.completedAt = today();
  } else if (!allDone) {
    p.completedAt = null;
  }
}
