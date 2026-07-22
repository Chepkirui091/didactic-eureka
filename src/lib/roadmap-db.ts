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
  getFirstIncompleteDay,
  computeRoadmapStreaks,
  isDayUnlocked,
  getDayLockMessage,
  isDayFullyComplete,
  definitionToSummary,
  type RoadmapDefinition,
} from "./roadmap-core";
import { getRoadmapDefinition, ROADMAP_DEFINITIONS, requireRoadmapDefinition } from "./roadmap-registry";
import { getPrisma } from "./prisma";
import { DEMO_USER_ID, ensureDemoUser } from "./habits-db";

function defaultBlocks(def: RoadmapDefinition): Record<TimeBlockId, EntryStatus> {
  const blocks = {} as Record<TimeBlockId, EntryStatus>;
  for (const block of def.timeBlocks) blocks[block.id] = "pending";
  return blocks;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function rowToProgress(
  row: {
    dayNumber: number;
    blocks: unknown;
    taskStatuses?: unknown;
    notes: string | null;
    builtItems: string | null;
    learnNotes: string | null;
    dayCompleted: boolean;
    updatedAt: Date;
  },
  def: RoadmapDefinition,
): RoadmapDayProgress {
  const blocks = (row.blocks ?? defaultBlocks(def)) as Record<TimeBlockId, EntryStatus>;
  const taskStatuses = (row.taskStatuses ?? {}) as Record<string, EntryStatus>;
  return {
    dayNumber: row.dayNumber,
    blocks,
    taskStatuses,
    notes: row.notes ?? "",
    builtItems: row.builtItems ?? "",
    learnNotes: row.learnNotes ?? "",
    dayCompleted: row.dayCompleted,
    completedAt: row.dayCompleted ? today() : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function computeActivityFromProgress(
  def: RoadmapDefinition,
  progress: RoadmapDayProgress[],
): Record<string, number> {
  const activity: Record<string, number> = {};
  for (const p of progress) {
    const date = p.updatedAt.slice(0, 10);
    const blockCount = def.timeBlocks.filter((b) => p.blocks[b.id] === "completed").length;
    const taskCount = Object.values(p.taskStatuses).filter((s) => s === "completed").length;
    const completedCount = blockCount + taskCount;
    if (completedCount > 0) {
      activity[date] = (activity[date] ?? 0) + completedCount;
    }
  }
  return activity;
}

async function loadAllProgress(def: RoadmapDefinition): Promise<RoadmapDayProgress[]> {
  await ensureDemoUser();
  const rows = await getPrisma().roadmapDayProgress.findMany({
    where: { userId: DEMO_USER_ID, roadmapId: def.id },
  });
  const byDay = new Map(rows.map((r) => [r.dayNumber, rowToProgress(r, def)]));
  return def.days.map(
    (d) => byDay.get(d.dayNumber) ?? createEmptyDayProgress(d.dayNumber, def.timeBlocks),
  );
}

async function ensureDayRow(def: RoadmapDefinition, dayNumber: number) {
  await ensureDemoUser();
  return getPrisma().roadmapDayProgress.upsert({
    where: {
      userId_roadmapId_dayNumber: {
        userId: DEMO_USER_ID,
        roadmapId: def.id,
        dayNumber,
      },
    },
    update: {},
    create: {
      userId: DEMO_USER_ID,
      roadmapId: def.id,
      dayNumber,
      blocks: defaultBlocks(def),
      taskStatuses: {},
    },
  });
}

export async function listRoadmapSummariesDb(): Promise<RoadmapSummary[]> {
  const summaries: RoadmapSummary[] = [];
  for (const def of ROADMAP_DEFINITIONS) {
    try {
      const overview = await getRoadmapOverviewDb(def.id);
      summaries.push(definitionToSummary(def, overview));
    } catch {
      summaries.push(definitionToSummary(def, null));
    }
  }
  return summaries;
}

export async function getRoadmapOverviewDb(roadmapId: string): Promise<RoadmapOverview> {
  const def = requireRoadmapDefinition(roadmapId);
  const progress = await loadAllProgress(def);
  const activity = computeActivityFromProgress(def, progress);
  const firstRow = await getPrisma().roadmapDayProgress.findFirst({
    where: { userId: DEMO_USER_ID, roadmapId: def.id },
    orderBy: { createdAt: "asc" },
  });

  return {
    id: def.id,
    title: def.title,
    description: def.description,
    totalDays: def.days.length,
    startedAt: firstRow?.createdAt.toISOString() ?? null,
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

export async function getDayProgressDb(
  roadmapId: string,
  dayNumber: number,
): Promise<RoadmapDayProgress | null> {
  const def = getRoadmapDefinition(roadmapId);
  if (!def || dayNumber < 1 || dayNumber > def.days.length) return null;
  const row = await getPrisma().roadmapDayProgress.findUnique({
    where: {
      userId_roadmapId_dayNumber: {
        userId: DEMO_USER_ID,
        roadmapId: def.id,
        dayNumber,
      },
    },
  });
  return row
    ? rowToProgress(row, def)
    : createEmptyDayProgress(dayNumber, def.timeBlocks);
}

export async function startRoadmapDb(roadmapId: string): Promise<RoadmapOverview> {
  const def = requireRoadmapDefinition(roadmapId);
  await ensureDayRow(def, 1);
  return getRoadmapOverviewDb(def.id);
}

export async function checkDayAccessDb(roadmapId: string, dayNumber: number) {
  const def = requireRoadmapDefinition(roadmapId);
  const progress = await loadAllProgress(def);
  if (isDayUnlocked(dayNumber, progress, def.days.length)) {
    return { allowed: true, message: null, requiredDay: null };
  }
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
  return { allowed: false, message: "This day is locked.", requiredDay: dayNumber - 1 };
}

export async function updateBlockStatusDb(
  roadmapId: string,
  dayNumber: number,
  blockId: TimeBlockId,
  status: EntryStatus,
): Promise<RoadmapDayProgress | null> {
  const def = getRoadmapDefinition(roadmapId);
  if (!def || dayNumber < 1 || dayNumber > def.days.length) return null;
  const row = await ensureDayRow(def, dayNumber);
  const day = def.days.find((d) => d.dayNumber === dayNumber);
  const blocks = {
    ...(row.blocks as Record<TimeBlockId, EntryStatus>),
    [blockId]: status,
  };
  const taskStatuses = (row.taskStatuses ?? {}) as Record<string, EntryStatus>;
  const provisional: RoadmapDayProgress = {
    dayNumber,
    blocks,
    taskStatuses,
    notes: row.notes ?? "",
    builtItems: row.builtItems ?? "",
    learnNotes: row.learnNotes ?? "",
    dayCompleted: false,
    completedAt: null,
    updatedAt: new Date().toISOString(),
  };
  const dayCompleted = isDayFullyComplete(day, provisional, def.timeBlocks);

  const updated = await getPrisma().roadmapDayProgress.update({
    where: { id: row.id },
    data: { blocks, dayCompleted },
  });
  return rowToProgress(updated, def);
}

export async function updateTaskStatusDb(
  roadmapId: string,
  dayNumber: number,
  taskId: string,
  status: EntryStatus,
): Promise<RoadmapDayProgress | null> {
  const def = getRoadmapDefinition(roadmapId);
  if (!def || dayNumber < 1 || dayNumber > def.days.length) return null;
  const row = await ensureDayRow(def, dayNumber);
  const day = def.days.find((d) => d.dayNumber === dayNumber);
  const blocks = (row.blocks as Record<TimeBlockId, EntryStatus>) ?? defaultBlocks(def);
  const taskStatuses = {
    ...((row.taskStatuses ?? {}) as Record<string, EntryStatus>),
    [taskId]: status,
  };
  const provisional: RoadmapDayProgress = {
    dayNumber,
    blocks,
    taskStatuses,
    notes: row.notes ?? "",
    builtItems: row.builtItems ?? "",
    learnNotes: row.learnNotes ?? "",
    dayCompleted: false,
    completedAt: null,
    updatedAt: new Date().toISOString(),
  };
  const dayCompleted = isDayFullyComplete(day, provisional, def.timeBlocks);

  const updated = await getPrisma().roadmapDayProgress.update({
    where: { id: row.id },
    data: { taskStatuses, dayCompleted },
  });
  return rowToProgress(updated, def);
}

export async function updateDayNotesDb(
  roadmapId: string,
  dayNumber: number,
  data: {
    notes?: string;
    builtItems?: string;
    learnNotes?: string;
  },
): Promise<RoadmapDayProgress | null> {
  const def = getRoadmapDefinition(roadmapId);
  if (!def || dayNumber < 1 || dayNumber > def.days.length) return null;
  const row = await ensureDayRow(def, dayNumber);
  const day = def.days.find((d) => d.dayNumber === dayNumber);
  const blocks = row.blocks as Record<TimeBlockId, EntryStatus>;
  const taskStatuses = (row.taskStatuses ?? {}) as Record<string, EntryStatus>;
  const provisional: RoadmapDayProgress = {
    dayNumber,
    blocks,
    taskStatuses,
    notes: data.notes ?? row.notes ?? "",
    builtItems: data.builtItems ?? row.builtItems ?? "",
    learnNotes: data.learnNotes ?? row.learnNotes ?? "",
    dayCompleted: false,
    completedAt: null,
    updatedAt: new Date().toISOString(),
  };

  const updated = await getPrisma().roadmapDayProgress.update({
    where: { id: row.id },
    data: {
      notes: data.notes ?? row.notes,
      builtItems: data.builtItems ?? row.builtItems,
      learnNotes: data.learnNotes ?? row.learnNotes,
      dayCompleted: isDayFullyComplete(day, provisional, def.timeBlocks),
    },
  });
  return rowToProgress(updated, def);
}
