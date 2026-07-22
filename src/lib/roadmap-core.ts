import type {
  EntryStatus,
  RoadmapDay,
  RoadmapDayProgress,
  RoadmapOverview,
  RoadmapSummary,
  StreakInfo,
  TimeBlockConfig,
  TimeBlockId,
} from "./types";

export const DEFAULT_TIME_BLOCKS: TimeBlockConfig[] = [
  {
    id: "learn",
    label: "Learn",
    startTime: "05:30",
    endTime: "07:30",
    description: "Watch or read concepts (1–2 hours)",
  },
  {
    id: "rebuild",
    label: "Rebuild",
    startTime: "09:30",
    endTime: "10:00",
    description: "Rebuild yesterday's feature from memory",
  },
  {
    id: "build",
    label: "Build",
    startTime: "19:30",
    endTime: "21:30",
    description: "Implement today's feature immediately (2 hours)",
  },
  {
    id: "test",
    label: "Test",
    startTime: "21:30",
    endTime: "22:00",
    description: "Break things intentionally and fix them",
  },
];

export interface RoadmapDefinition {
  id: string;
  title: string;
  description: string;
  tags: string[];
  accent: string;
  timeBlocks: TimeBlockConfig[];
  weekGoals: Record<number, string>;
  days: RoadmapDay[];
}

export function countDayTasks(day: RoadmapDay): number {
  return day.projects?.reduce((sum, p) => sum + p.tasks.length, 0) ?? 0;
}

export function countRoadmapTasks(days: RoadmapDay[]): number {
  return days.reduce((sum, d) => sum + countDayTasks(d), 0);
}

export function listDayTaskIds(day: RoadmapDay): string[] {
  return day.projects?.flatMap((p) => p.tasks.map((t) => t.id)) ?? [];
}

export function createEmptyDayProgress(
  dayNumber: number,
  timeBlocks: TimeBlockConfig[],
): RoadmapDayProgress {
  const blocks = {} as Record<TimeBlockId, EntryStatus>;
  for (const block of timeBlocks) {
    blocks[block.id] = "pending";
  }
  return {
    dayNumber,
    blocks,
    taskStatuses: {},
    notes: "",
    builtItems: "",
    learnNotes: "",
    dayCompleted: false,
    completedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

export function formatTimeRange(start: string, end: string): string {
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

export function isDayUnlocked(
  dayNumber: number,
  progress: RoadmapDayProgress[],
  totalDays: number,
): boolean {
  if (dayNumber < 1 || dayNumber > totalDays) return false;
  if (dayNumber === 1) return true;
  for (let d = 1; d < dayNumber; d++) {
    const p = progress.find((x) => x.dayNumber === d);
    if (!p?.dayCompleted) return false;
  }
  return true;
}

export function getDayLockMessage(
  dayNumber: number,
  progress: RoadmapDayProgress[],
  totalDays: number,
): string | null {
  if (isDayUnlocked(dayNumber, progress, totalDays)) return null;
  for (let d = 1; d < dayNumber; d++) {
    const p = progress.find((x) => x.dayNumber === d);
    if (!p?.dayCompleted) {
      return `Complete Day ${d} first before unlocking this day.`;
    }
  }
  return "This day is locked.";
}

export function getFirstIncompleteDay(
  progress: RoadmapDayProgress[],
  totalDays: number,
): number {
  const first = progress.find((p) => !p.dayCompleted);
  return first?.dayNumber ?? totalDays;
}

/** Days with nested projects complete when all child tasks are done; otherwise all time blocks. */
export function isDayFullyComplete(
  day: RoadmapDay | undefined,
  progress: RoadmapDayProgress,
  timeBlocks: TimeBlockConfig[],
): boolean {
  const taskIds = day ? listDayTaskIds(day) : [];
  if (taskIds.length > 0) {
    return taskIds.every((id) => progress.taskStatuses[id] === "completed");
  }
  return timeBlocks.every((b) => progress.blocks[b.id] === "completed");
}

export function computeRoadmapStats(
  days: RoadmapDay[],
  progress: RoadmapDayProgress[],
  timeBlocks: TimeBlockConfig[],
) {
  const daysCompleted = progress.filter((p) => p.dayCompleted).length;
  let blocksCompleted = 0;
  const totalBlocks = days.length * timeBlocks.length;
  for (const p of progress) {
    for (const block of timeBlocks) {
      if (p.blocks[block.id] === "completed") blocksCompleted += 1;
    }
  }

  const totalTasks = countRoadmapTasks(days);
  let tasksCompleted = 0;
  for (const day of days) {
    const p = progress.find((x) => x.dayNumber === day.dayNumber);
    if (!p) continue;
    for (const id of listDayTaskIds(day)) {
      if (p.taskStatuses[id] === "completed") tasksCompleted += 1;
    }
  }

  const unitsDone = totalTasks > 0 ? tasksCompleted : blocksCompleted;
  const unitsTotal = totalTasks > 0 ? totalTasks : totalBlocks;

  return {
    daysCompleted,
    blocksCompleted,
    totalBlocks,
    tasksCompleted,
    totalTasks,
    completionPercentage: unitsTotal
      ? Math.round((unitsDone / unitsTotal) * 100)
      : 0,
  };
}

function roadmapToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function roadmapDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function computeDayCompletionStreak(
  progress: RoadmapDayProgress[],
  totalDays: number,
): StreakInfo {
  let current = 0;
  for (let d = 1; d <= totalDays; d++) {
    const p = progress.find((x) => x.dayNumber === d);
    if (p?.dayCompleted) current++;
    else break;
  }
  let longest = 0;
  let run = 0;
  for (let d = 1; d <= totalDays; d++) {
    const p = progress.find((x) => x.dayNumber === d);
    if (p?.dayCompleted) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  return { current, longest };
}

export function computeStudyStreak(activityByDate: Record<string, number>): StreakInfo {
  const today = roadmapToday();
  const yesterday = roadmapDateOffset(-1);
  const dates = Object.entries(activityByDate)
    .filter(([, count]) => count > 0)
    .map(([date]) => date)
    .sort((a, b) => a.localeCompare(b));

  if (dates.length === 0) return { current: 0, longest: 0 };

  let longest = 0;
  let run = 0;
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = new Date(dates[i - 1]).getTime();
      const curr = new Date(dates[i]).getTime();
      const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
      run = diffDays === 1 ? run + 1 : 1;
    }
    longest = Math.max(longest, run);
  }

  const latest = dates[dates.length - 1];
  let current = 0;
  if (latest === today || latest === yesterday) {
    current = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
      const prev = new Date(dates[i]).getTime();
      const next = new Date(dates[i + 1]).getTime();
      const diffDays = (next - prev) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) current++;
      else break;
    }
  }

  return { current, longest };
}

export function computeRoadmapStreaks(
  progress: RoadmapDayProgress[],
  activityByDate: Record<string, number>,
  totalDays: number,
) {
  return {
    days: computeDayCompletionStreak(progress, totalDays),
    study: computeStudyStreak(activityByDate),
  };
}

export function getRoadmapActivityByDate(
  activityByDate: Record<string, number>,
  daysBack: number,
): Record<string, number> {
  const today = roadmapToday();
  const out: Record<string, number> = {};
  const end = new Date(today);
  for (let i = 0; i <= daysBack; i++) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    out[dateStr] = activityByDate[dateStr] ?? 0;
  }
  return out;
}

export function definitionToSummary(
  def: RoadmapDefinition,
  overview?: Pick<
    RoadmapOverview,
    "startedAt" | "currentDay" | "stats"
  > | null,
): RoadmapSummary {
  return {
    id: def.id,
    title: def.title,
    description: def.description,
    totalDays: def.days.length,
    tags: def.tags,
    accent: def.accent,
    hasProjects: def.days.some((d) => (d.projects?.length ?? 0) > 0),
    startedAt: overview?.startedAt ?? null,
    currentDay: overview?.currentDay ?? 1,
    daysCompleted: overview?.stats.daysCompleted ?? 0,
    completionPercentage: overview?.stats.completionPercentage ?? 0,
  };
}
