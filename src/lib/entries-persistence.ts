import type { EntryStatus, HabitEntry } from "./types";
import { todayString } from "./streak";

const STORAGE_KEY = "habitflow:entries";

type EntryKey = `${string}:${string}`;

function entryKey(habitId: string, date: string): EntryKey {
  return `${habitId}:${date}`;
}

function loadAll(): Record<EntryKey, EntryStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<EntryKey, EntryStatus>) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<EntryKey, EntryStatus>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("entries-updated"));
}

export function saveEntryStatus(habitId: string, date: string, status: EntryStatus): void {
  const all = loadAll();
  all[entryKey(habitId, date)] = status;
  saveAll(all);
}

export function applyEntryOverrides(entries: HabitEntry[], date: string): HabitEntry[] {
  const overrides = loadAll();
  const byHabit = new Map(entries.map((e) => [e.habitId, e]));

  for (const [key, status] of Object.entries(overrides)) {
    const [habitId, entryDate] = key.split(":") as [string, string];
    if (entryDate !== date) continue;
    const existing = byHabit.get(habitId);
    byHabit.set(habitId, {
      ...(existing ?? {
        id: `local-${habitId}-${date}`,
        habitId,
        date,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  return [...byHabit.values()];
}

export function mergeApiEntriesWithStorage(
  apiEntries: HabitEntry[],
  date: string,
): HabitEntry[] {
  return applyEntryOverrides(apiEntries, date);
}

export function getTodayFromStorage(): string {
  return todayString();
}
