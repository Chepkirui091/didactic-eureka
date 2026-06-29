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

// ---- NestJS 30-Day Roadmap ----

export type TimeBlockId = "learn" | "rebuild" | "build" | "test";

export interface TimeBlockConfig {
  id: TimeBlockId;
  label: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface RoadmapDay {
  dayNumber: number;
  week: number;
  weekLabel: string;
  title: string;
  goal?: string;
  topics: string[];
  task: string;
  isReviewDay?: boolean;
  isMiniProject?: boolean;
}

export interface RoadmapDayProgress {
  dayNumber: number;
  blocks: Record<TimeBlockId, EntryStatus>;
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
  stats: {
    daysCompleted: number;
    blocksCompleted: number;
    totalBlocks: number;
    completionPercentage: number;
  };
  streaks: RoadmapStreaks;
  activityByDate: Record<string, number>;
}
