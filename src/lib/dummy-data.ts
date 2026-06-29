/**
 * Dummy data for habit tracker - use to structure the UI and develop without DB.
 * Replace with API calls when backend is ready.
 */

import type {
  Habit,
  HabitEntry,
  Reminder,
  UserPreferences,
  Badge,
  ScheduleConfig,
} from "./types";

const NOW = new Date();
const today = NOW.toISOString().slice(0, 10);

function dateOffset(days: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Build entries for last 60 days with realistic patterns
function buildEntries(habitId: string, completionPattern: (d: Date) => boolean): HabitEntry[] {
  const entries: HabitEntry[] = [];
  for (let i = -60; i <= 0; i++) {
    const d = new Date(NOW);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const completed = completionPattern(d);
    entries.push({
      id: `entry-${habitId}-${dateStr}`,
      habitId,
      date: dateStr,
      status: completed ? "completed" : (i % 7 === 0 ? "skipped" : "missed"),
      value: completed && habitId === "h2" ? 25 + Math.floor(Math.random() * 15) : null,
      durationMinutes: completed && habitId === "h3" ? 12 + Math.floor(Math.random() * 8) : null,
      createdAt: dateStr,
      updatedAt: dateStr,
    });
  }
  return entries;
}

export const DUMMY_USER_ID = "user-demo";

export const dummyPreferences: UserPreferences = {
  theme: "system",
  accentColor: "emerald",
  weekStartsOn: 1,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  fontSize: "medium",
  highContrast: false,
  stopReminderWhenDone: true,
  endOfDayRecap: true,
};

export const dummyHabits: Habit[] = [
  {
    id: "h1",
    userId: DUMMY_USER_ID,
    name: "Drink Water",
    description: "Stay hydrated throughout the day.",
    motivation: "Energy and focus.",
    category: "health",
    icon: "💧",
    sortOrder: 0,
    habitType: "binary",
    targetValue: null,
    targetUnit: null,
    targetDurationMinutes: null,
    startDate: dateOffset(-90),
    endDate: null,
    schedule: { frequency: "daily", timesPerDay: 1 } as ScheduleConfig,
    createdAt: dateOffset(-90),
    updatedAt: today,
  },
  {
    id: "h2",
    userId: DUMMY_USER_ID,
    name: "Read",
    description: "Read books to learn and relax.",
    motivation: "30 pages a day adds up.",
    category: "learning",
    icon: "📖",
    sortOrder: 1,
    habitType: "quantitative",
    targetValue: 30,
    targetUnit: "pages",
    targetDurationMinutes: null,
    startDate: dateOffset(-60),
    endDate: null,
    schedule: { frequency: "daily" } as ScheduleConfig,
    createdAt: dateOffset(-60),
    updatedAt: today,
  },
  {
    id: "h3",
    userId: DUMMY_USER_ID,
    name: "Meditate",
    description: "Short daily meditation.",
    motivation: "Calm and clarity.",
    category: "mental",
    icon: "🧘",
    sortOrder: 2,
    habitType: "timed",
    targetValue: null,
    targetUnit: null,
    targetDurationMinutes: 15,
    startDate: dateOffset(-45),
    endDate: null,
    schedule: { frequency: "daily" } as ScheduleConfig,
    createdAt: dateOffset(-45),
    updatedAt: today,
  },
  {
    id: "h4",
    userId: DUMMY_USER_ID,
    name: "Exercise",
    description: "Move your body.",
    motivation: "Strength and mood.",
    category: "health",
    icon: "🏃",
    sortOrder: 3,
    habitType: "binary",
    targetValue: null,
    targetUnit: null,
    targetDurationMinutes: null,
    startDate: dateOffset(-30),
    endDate: null,
    schedule: { frequency: "weekly", daysOfWeek: [1, 3, 5] } as ScheduleConfig,
    createdAt: dateOffset(-30),
    updatedAt: today,
  },
  {
    id: "h5",
    userId: DUMMY_USER_ID,
    name: "10,000 Steps",
    description: "Daily step goal.",
    motivation: "Cardio and activity.",
    category: "health",
    icon: "👟",
    sortOrder: 4,
    habitType: "quantitative",
    targetValue: 10000,
    targetUnit: "steps",
    targetDurationMinutes: null,
    startDate: dateOffset(-21),
    endDate: null,
    schedule: { frequency: "daily" } as ScheduleConfig,
    createdAt: dateOffset(-21),
    updatedAt: today,
  },
];

// Entries: water ~85%, read ~70%, meditate ~65%, exercise on Mon/Wed/Fri, steps ~50%
export const dummyEntries: HabitEntry[] = [
  ...buildEntries("h1", (d) => Math.random() < 0.85),
  ...buildEntries("h2", (d) => Math.random() < 0.7),
  ...buildEntries("h3", (d) => Math.random() < 0.65),
  ...buildEntries("h4", (d) => [1, 3, 5].includes(d.getDay()) && Math.random() < 0.8),
  ...buildEntries("h5", (d) => Math.random() < 0.5),
];

export const dummyReminders: Reminder[] = [
  {
    id: "r1",
    userId: DUMMY_USER_ID,
    habitId: "h1",
    time: "08:00",
    message: "Start the day with water 💧",
    strict: false,
    enabled: true,
    createdAt: today,
    updatedAt: today,
  },
  {
    id: "r2",
    userId: DUMMY_USER_ID,
    habitId: "h3",
    time: "07:30",
    message: "Morning meditation",
    strict: false,
    enabled: true,
    createdAt: today,
    updatedAt: today,
  },
  {
    id: "r3",
    userId: DUMMY_USER_ID,
    habitId: null,
    time: "21:00",
    message: "End of day - how did your habits go?",
    strict: false,
    enabled: true,
    createdAt: today,
    updatedAt: today,
  },
];

export const dummyBadges: Badge[] = [
  { id: "b1", name: "First Week", description: "7-day streak", icon: "🔥", earnedAt: dateOffset(-50), requirement: "7-day streak" },
  { id: "b2", name: "Consistent Reader", description: "Read 30 days", icon: "📚", earnedAt: dateOffset(-20), requirement: "30 days reading" },
  { id: "b3", name: "Mindful Month", description: "30-day meditation streak", icon: "🧘", earnedAt: null, requirement: "30-day meditation streak" },
  { id: "b4", name: "Hundred Club", description: "100 total completions", icon: "💯", earnedAt: dateOffset(-10), requirement: "100 completions" },
  { id: "b5", name: "Early Riser", description: "Complete a habit before 8am for 7 days", icon: "🌅", earnedAt: null, requirement: "7 days before 8am" },
];

// Helpers for UI
export function getEntriesForHabit(habitId: string): HabitEntry[] {
  return dummyEntries.filter((e) => e.habitId === habitId);
}

export function getEntriesForDate(date: string): HabitEntry[] {
  return dummyEntries.filter((e) => e.date === date);
}

export function getTodaysEntries(): HabitEntry[] {
  return getEntriesForDate(today);
}

export function computeStreak(habitId: string): { current: number; longest: number } {
  const entries = getEntriesForHabit(habitId)
    .filter((e) => e.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date));
  const dates = [...new Set(entries.map((e) => e.date))].sort((a, b) => b.localeCompare(a));
  let current = 0;
  let longest = 0;
  let run = 0;
  const sortedDates = dates.slice().sort((a, b) => a.localeCompare(b));
  for (let i = 0; i < sortedDates.length; i++) {
    const prev = i > 0 ? sortedDates[i - 1] : null;
    const curr = sortedDates[i];
    const prevDay = prev ? new Date(prev).getTime() : 0;
    const currDay = new Date(curr).getTime();
    const diffDays = (currDay - prevDay) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) run++;
    else run = 1;
    longest = Math.max(longest, run);
    if (curr === today || (run > 0 && curr >= dateOffset(-1))) current = run;
  }
  if (current === 0 && dates[0] === today) current = 1;
  return { current, longest };
}

export function dailyGoal(): { total: number; completed: number; percentage: number } {
  const todays = getTodaysEntries();
  const relevantHabits = dummyHabits.filter((h) => {
    const s = h.schedule as { frequency: string; daysOfWeek?: number[] };
    if (s.frequency === "daily") return true;
    if (s.frequency === "weekly" && s.daysOfWeek) {
      const day = new Date(today).getDay();
      return s.daysOfWeek.includes(day);
    }
    return true;
  });
  const total = relevantHabits.length;
  const completed = todays.filter((e) => e.status === "completed").length;
  return { total, completed, percentage: total ? Math.round((completed / total) * 100) : 0 };
}

/** Completion count per day (all habits) for the last N days. Used for GitHub-style heatmap. */
export function getActivityCountByDate(daysBack: number): Map<string, number> {
  const map = new Map<string, number>();
  const end = new Date(today);
  for (let i = 0; i <= daysBack; i++) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    map.set(dateStr, 0);
  }
  for (const e of dummyEntries) {
    if (e.status === "completed" && map.has(e.date)) {
      map.set(e.date, (map.get(e.date) ?? 0) + 1);
    }
  }
  return map;
}

export { today as dummyToday };
