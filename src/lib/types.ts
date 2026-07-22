// Shared types for habit tracker (aligns with Prisma when used)

export type HabitCategory =
  | "health"
  | "work"
  | "learning"
  | "finance"
  | "mental"
  | "general";

export type HabitType = "binary" | "quantitative" | "timed";

export type EntryStatus = "pending" | "completed" | "missed" | "skipped";

export type Frequency = "daily" | "weekly" | "monthly" | "custom";

export interface ScheduleConfig {
  frequency: Frequency;
  daysOfWeek?: number[]; // 0-6
  intervalDays?: number; // e.g. every 2 days
  timesPerDay?: number;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  motivation?: string | null;
  category: HabitCategory;
  icon?: string | null;
  sortOrder: number;
  habitType: HabitType;
  targetValue?: number | null;
  targetUnit?: string | null;
  targetDurationMinutes?: number | null;
  startDate: string;
  endDate?: string | null;
  schedule: ScheduleConfig;
  createdAt: string;
  updatedAt: string;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string;
  status: EntryStatus;
  value?: number | null;
  durationMinutes?: number | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  habitId?: string | null;
  time: string;
  message?: string | null;
  strict: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  accentColor: string;
  weekStartsOn: number;
  timezone: string;
  fontSize: "small" | "medium" | "large";
  highContrast: boolean;
  stopReminderWhenDone: boolean;
  endOfDayRecap: boolean;
}

export interface StreakInfo {
  current: number;
  longest: number;
  graceUsedThisPeriod?: number;
}

export interface HabitWithStats extends Habit {
  entries?: HabitEntry[];
  streak?: StreakInfo;
  completionRate?: number;
  lastCompleted?: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string | null;
  requirement: string;
}

export interface DailyGoal {
  total: number;
  completed: number;
  percentage: number;
}

// ---- Learning roadmaps / projects ----

export type TimeBlockId = "learn" | "rebuild" | "build" | "test";
export type RoadmapTrack = "backend" | "frontend" | "shared";

export interface TimeBlockConfig {
  id: TimeBlockId;
  label: string;
  startTime: string;
  endTime: string;
  description: string;
}

/** Leaf checklist item inside a day project (e.g. "Register endpoint"). */
export interface RoadmapChildTask {
  id: string;
  label: string;
}

/** Parent project on a day — backend and frontend stay separate. */
export interface RoadmapProject {
  id: string;
  title: string;
  track: RoadmapTrack;
  description?: string;
  tasks: RoadmapChildTask[];
}

export interface RoadmapDay {
  dayNumber: number;
  week: number;
  weekLabel: string;
  title: string;
  goal?: string;
  topics: string[];
  task: string;
  /** Nested projects with child tasks (ticket API roadmap, etc.). */
  projects?: RoadmapProject[];
  checklist?: string[];
  isReviewDay?: boolean;
  isMiniProject?: boolean;
}

export interface RoadmapDayProgress {
  dayNumber: number;
  blocks: Record<TimeBlockId, EntryStatus>;
  /** Child task completion keyed by RoadmapChildTask.id */
  taskStatuses: Record<string, EntryStatus>;
  notes: string;
  builtItems: string;
  learnNotes: string;
  dayCompleted: boolean;
  completedAt: string | null;
  updatedAt: string;
}

export interface RoadmapStreaks {
  days: StreakInfo;
  study: StreakInfo;
}

export interface RoadmapOverview {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  startedAt: string | null;
  currentDay: number;
  days: RoadmapDay[];
  timeBlocks: TimeBlockConfig[];
  progress: RoadmapDayProgress[];
  weekGoals?: Record<number, string>;
  accent?: string;
  tags?: string[];
  stats: {
    daysCompleted: number;
    blocksCompleted: number;
    totalBlocks: number;
    tasksCompleted: number;
    totalTasks: number;
    completionPercentage: number;
  };
  streaks: RoadmapStreaks;
  activityByDate: Record<string, number>;
}

/** Card shown on the projects index. */
export interface RoadmapSummary {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  tags: string[];
  accent: string;
  hasProjects: boolean;
  startedAt: string | null;
  currentDay: number;
  daysCompleted: number;
  completionPercentage: number;
}
