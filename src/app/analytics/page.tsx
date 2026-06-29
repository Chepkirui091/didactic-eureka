"use client";

import { useMemo, useState, useCallback } from "react";
import { BarChart3, Calendar, Lightbulb } from "lucide-react";
import { computeStreakFromEntries } from "@/lib/streak";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import type { Habit, HabitEntry } from "@/lib/types";

export default function AnalyticsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [allEntries, setAllEntries] = useState<HabitEntry[]>([]);

  const refresh = useCallback(async () => {
    const [habitsRes, entriesRes] = await Promise.all([
      fetch("/api/habits"),
      fetch("/api/entries?daysBack=90"),
    ]);
    if (habitsRes.ok) {
      const data = await habitsRes.json();
      setHabits(Array.isArray(data) ? data : []);
    }
    if (entriesRes.ok) {
      const data = await entriesRes.json();
      setAllEntries(Array.isArray(data) ? data : []);
    }
  }, []);

  useLiveRefresh(refresh, [refresh]);

  const habitsWithStats = useMemo(() => {
    return habits.map((h) => {
      const entries = allEntries.filter((e) => e.habitId === h.id);
      const completed = entries.filter((e) => e.status === "completed").length;
      const total = entries.length;
      const rate = total ? Math.round((completed / total) * 100) : 0;
      const streak = computeStreakFromEntries(entries);
      return {
        ...h,
        completionRate: rate,
        completed,
        total,
        streakCurrent: streak.current,
        streakLongest: streak.longest,
      };
    });
  }, [habits, allEntries]);

  const mostSkipped = useMemo(() => {
    const byHabit = new Map<string, number>();
    for (const e of allEntries) {
      if (e.status === "skipped") {
        byHabit.set(e.habitId, (byHabit.get(e.habitId) ?? 0) + 1);
      }
    }
    return [...byHabit.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([habitId]) => habits.find((h) => h.id === habitId)?.name ?? habitId);
  }, [allEntries, habits]);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const byWeekday = useMemo(() => {
    const count = [0, 0, 0, 0, 0, 0, 0];
    for (const e of allEntries) {
      if (e.status === "completed") {
        const d = new Date(e.date).getDay();
        count[d] += 1;
      }
    }
    const max = Math.max(...count, 1);
    return weekdays.map((label, i) => ({
      label,
      count: count[i],
      pct: Math.round((count[i] / max) * 100),
    }));
  }, [allEntries]);

  const today = new Date().toISOString().slice(0, 10);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  const weekStats = useMemo(() => {
    let completed = 0;
    let total = 0;
    for (const e of allEntries) {
      if (e.date >= weekStartStr && e.date <= today) {
        total += 1;
        if (e.status === "completed") completed += 1;
      }
    }
    return { completed, total, pct: total ? Math.round((completed / total) * 100) : 0 };
  }, [allEntries, today, weekStartStr]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-[var(--muted)] mt-1">
          Patterns, streaks, and insights from your habit data.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide">This week</p>
          <p className="text-2xl font-bold mt-1">{weekStats.pct}%</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {weekStats.completed}/{weekStats.total} completed
          </p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Active habits</p>
          <p className="text-2xl font-bold mt-1">{habits.length}</p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Logged days</p>
          <p className="text-2xl font-bold mt-1">{allEntries.length}</p>
        </div>
      </section>

      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
          Completion by habit
        </h2>
        <div className="space-y-4">
          {habitsWithStats.map((h) => (
            <div key={h.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{h.icon} {h.name}</span>
                <span className="text-[var(--muted)]">{h.completionRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${h.completionRate}%`,
                    background: "hsl(var(--accent))",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
          Best days of the week
        </h2>
        <div className="flex items-end gap-2 h-32">
          {byWeekday.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm"
                style={{
                  height: `${Math.max(d.pct, 4)}%`,
                  background: "hsl(var(--accent))",
                }}
              />
              <span className="text-xs text-[var(--muted)]">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
          Insights
        </h2>
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          {mostSkipped.length > 0 && (
            <li>
              Most skipped:{" "}
              <span className="text-[var(--foreground)]">{mostSkipped.join(", ")}</span>.
              Consider making these easier or rescheduling them.
            </li>
          )}
          {habitsWithStats.length > 0 && (
            <li>
              Strongest habit:{" "}
              <span className="text-[var(--foreground)]">
                {[...habitsWithStats].sort((a, b) => b.completionRate - a.completionRate)[0]?.name}
              </span>
              .
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
