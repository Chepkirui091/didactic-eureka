import type { HabitCategory, HabitType, Frequency } from "./types";

export const CATEGORY_OPTIONS: { value: HabitCategory; label: string }[] = [
  { value: "health", label: "Health" },
  { value: "work", label: "Work" },
  { value: "learning", label: "Learning" },
  { value: "finance", label: "Finance" },
  { value: "mental", label: "Mental" },
  { value: "general", label: "General" },
];

export const HABIT_TYPE_OPTIONS: { value: HabitType; label: string }[] = [
  { value: "binary", label: "Done / Not done" },
  { value: "quantitative", label: "Quantity (e.g. pages, steps)" },
  { value: "timed", label: "Timed (e.g. minutes)" },
];

export const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly (choose days)" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Every N days" },
];

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export const ICON_OPTIONS = ["💧", "📖", "🧘", "🏃", "👟", "💪", "🌅", "🧠", "💰", "✍️", "🎯", "✨", "❤️", "📱", "🛏️"];
