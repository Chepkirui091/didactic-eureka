import type { HabitEntry } from "./types";

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dateOffsetString(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Compute streak from a list of entries for one habit. */
export function computeStreakFromEntries(
  entries: HabitEntry[],
  today = todayString(),
): { current: number; longest: number } {
  const dates = [
    ...new Set(
      entries.filter((e) => e.status === "completed").map((e) => e.date),
    ),
  ].sort((a, b) => a.localeCompare(b));

  if (dates.length === 0) return { current: 0, longest: 0 };

  let longest = 0;
  let run = 0;
  const yesterday = dateOffsetString(-1);

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

  let current = 0;
  const latest = dates[dates.length - 1];
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
