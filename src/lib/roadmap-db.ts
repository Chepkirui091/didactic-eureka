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
  isDayUnlocked,
  getDayLockMessage,
} from "./nestjs-roadmap-data";
import { getPrisma } from "./prisma";
import { DEMO_USER_ID, ensureDemoUser } from "./habits-db";

function defaultBlocks(): Record<TimeBlockId, EntryStatus> {
  const blocks = {} as Record<TimeBlockId, EntryStatus>;
  for (const block of TIME_BLOCKS) blocks[block.id] = "pending";
  return blocks;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function rowToProgress(row: {
  dayNumber: number;
  blocks: unknown;
  notes: string | null;
  builtItems: string | null;
  learnNotes: string | null;
  dayCompleted: boolean;
  updatedAt: Date;
}): RoadmapDayProgress {
  const blocks = (row.blocks ?? defaultBlocks()) as Record<TimeBlockId, EntryStatus>;
  return {
    dayNumber: row.dayNumber,
    blocks,
    notes: row.notes ?? "",
    builtItems: row.builtItems ?? "",
    learnNotes: row.learnNotes ?? "",
    dayCompleted: row.dayCompleted,
    completedAt: row.dayCompleted ? today() : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function computeActivityFromProgress(progress: RoadmapDayProgress[]): Record<string, number> {
  const activity: Record<string, number> = {};
  for (const p of progress) {
    const date = p.updatedAt.slice(0, 10);
    const completedCount = TIME_BLOCKS.filter((b) => p.blocks[b.id] === "completed").length;
    if (completedCount > 0) {
      activity[date] = (activity[date] ?? 0) + completedCount;
    }
  }
  return activity;
}

async function loadAllProgress(): Promise<RoadmapDayProgress[]> {
  await ensureDemoUser();
  const rows = await getPrisma().roadmapDayProgress.findMany({
    where: { userId: DEMO_USER_ID, roadmapId: ROADMAP_ID },
  });
  const byDay = new Map(rows.map((r) => [r.dayNumber, rowToProgress(r)]));
  return ROADMAP_DAYS.map(
    (d) => byDay.get(d.dayNumber) ?? createEmptyDayProgress(d.dayNumber),
  );
}

async function ensureDayRow(dayNumber: number) {
  await ensureDemoUser();
  return getPrisma().roadmapDayProgress.upsert({
    where: {
      userId_roadmapId_dayNumber: {
        userId: DEMO_USER_ID,
        roadmapId: ROADMAP_ID,
        dayNumber,
      },
    },
    update: {},
    create: {
      userId: DEMO_USER_ID,
      roadmapId: ROADMAP_ID,
      dayNumber,
      blocks: defaultBlocks(),
    },
  });
}

function syncDayCompleted(blocks: Record<TimeBlockId, EntryStatus>): boolean {
  return TIME_BLOCKS.every((b) => blocks[b.id] === "completed");
}

export async function getRoadmapOverviewDb(): Promise<RoadmapOverview> {
  const progress = await loadAllProgress();
  const activity = computeActivityFromProgress(progress);
  const firstRow = await getPrisma().roadmapDayProgress.findFirst({
    where: { userId: DEMO_USER_ID, roadmapId: ROADMAP_ID },
    orderBy: { createdAt: "asc" },
  });

  return {
    id: ROADMAP_ID,
    title: ROADMAP_TITLE,
    description: ROADMAP_DESCRIPTION,
    totalDays: ROADMAP_DAYS.length,
    startedAt: firstRow?.createdAt.toISOString() ?? null,
    currentDay: getFirstIncompleteDay(progress),
    days: ROADMAP_DAYS,
    timeBlocks: TIME_BLOCKS,
    progress,
    stats: computeRoadmapStats(progress),
    streaks: computeRoadmapStreaks(progress, activity),
    activityByDate: activity,
  };
}

export async function getDayProgressDb(dayNumber: number): Promise<RoadmapDayProgress | null> {
  if (dayNumber < 1 || dayNumber > 30) return null;
  const row = await getPrisma().roadmapDayProgress.findUnique({
    where: {
      userId_roadmapId_dayNumber: {
        userId: DEMO_USER_ID,
        roadmapId: ROADMAP_ID,
        dayNumber,
      },
    },
  });
  return row ? rowToProgress(row) : createEmptyDayProgress(dayNumber);
}

export async function startRoadmapDb(): Promise<RoadmapOverview> {
  await ensureDayRow(1);
  return getRoadmapOverviewDb();
}

export async function checkDayAccessDb(dayNumber: number) {
  const progress = await loadAllProgress();
  if (isDayUnlocked(dayNumber, progress)) {
    return { allowed: true, message: null, requiredDay: null };
  }
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
  return { allowed: false, message: "This day is locked.", requiredDay: dayNumber - 1 };
}

export async function updateBlockStatusDb(
  dayNumber: number,
  blockId: TimeBlockId,
  status: EntryStatus,
): Promise<RoadmapDayProgress | null> {
  if (dayNumber < 1 || dayNumber > 30) return null;
  const row = await ensureDayRow(dayNumber);
  const blocks = { ...(row.blocks as Record<TimeBlockId, EntryStatus>), [blockId]: status };
  const dayCompleted = syncDayCompleted(blocks);

  const updated = await getPrisma().roadmapDayProgress.update({
    where: { id: row.id },
    data: { blocks, dayCompleted },
  });
  return rowToProgress(updated);
}

export async function updateDayNotesDb(
  dayNumber: number,
  data: {
    notes?: string;
    builtItems?: string;
    learnNotes?: string;
  },
): Promise<RoadmapDayProgress | null> {
  if (dayNumber < 1 || dayNumber > 30) return null;
  const row = await ensureDayRow(dayNumber);
  const blocks = row.blocks as Record<TimeBlockId, EntryStatus>;

  const updated = await getPrisma().roadmapDayProgress.update({
    where: { id: row.id },
    data: {
      notes: data.notes ?? row.notes,
      builtItems: data.builtItems ?? row.builtItems,
      learnNotes: data.learnNotes ?? row.learnNotes,
      dayCompleted: syncDayCompleted(blocks),
    },
  });
  return rowToProgress(updated);
}
