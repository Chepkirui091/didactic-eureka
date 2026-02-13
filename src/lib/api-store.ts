/**
 * In-memory store for API mutations (demo mode).
 * Replace with Prisma/DB when backend is ready.
 */

import type { Habit, HabitEntry, EntryStatus } from "./types";
import { dummyHabits, dummyEntries } from "./dummy-data";

export const habitsStore: Habit[] = [...dummyHabits];

const entryMap = new Map<string, HabitEntry>();
for (const e of dummyEntries) {
  entryMap.set(`${e.habitId}:${e.date}`, e);
}

export function getEntriesForHabit(habitId: string): HabitEntry[] {
  const out: HabitEntry[] = [];
  for (const [, e] of entryMap) {
    if (e.habitId === habitId) out.push(e);
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export function setEntry(habitId: string, date: string, status: EntryStatus): HabitEntry {
  const id = `entry-${habitId}-${date}`;
  const entry: HabitEntry = {
    id,
    habitId,
    date,
    status,
    value: null,
    durationMinutes: null,
    note: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  entryMap.set(`${habitId}:${date}`, entry);
  return entry;
}

export function getEntry(habitId: string, date: string): HabitEntry | undefined {
  return entryMap.get(`${habitId}:${date}`);
}

export function updateHabit(id: string, data: Partial<Omit<Habit, "id" | "userId" | "createdAt">>): Habit | null {
  const idx = habitsStore.findIndex((h) => h.id === id);
  if (idx === -1) return null;
  const updated = { ...habitsStore[idx], ...data, updatedAt: new Date().toISOString() };
  habitsStore[idx] = updated;
  return updated;
}
