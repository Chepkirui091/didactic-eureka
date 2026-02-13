"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Flame, Target, ChevronRight, Check, Minus, Circle, TrendingUp, Award } from "lucide-react";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import {
  dummyHabits,
  getTodaysEntries,
  dummyToday,
  computeStreak,
  dailyGoal,
  getEntriesForHabit,
} from "@/lib/dummy-data";
import { getQuoteForDate } from "@/lib/quotes";
import type { Habit as HabitType, HabitEntry, EntryStatus } from "@/lib/types";

// Local overrides for today's entries (so Done/Skip/Miss update UI immediately)
function useTodaysEntriesWithOverrides() {
  const base = getTodaysEntries();
  const [overrides, setOverrides] = useState<Record<string, EntryStatus>>({});
  const entries: HabitEntry[] = useMemo(() => {
    const byHabit = new Map(base.map((e) => [e.habitId, e]));
    for (const [habitId, status] of Object.entries(overrides)) {
      byHabit.set(habitId, {
        ...(byHabit.get(habitId) ?? {
          id: `local-${habitId}`,
          habitId,
          date: dummyToday,
          status: "pending",
          createdAt: dummyToday,
          updatedAt: dummyToday,
        }),
        status,
      });
    }
    return [...byHabit.values()];
  }, [base, overrides]);
  const setStatus = useCallback((habitId: string, status: EntryStatus) => {
    setOverrides((prev) => ({ ...prev, [habitId]: status }));
    fetch(`/api/habits/${habitId}/complete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }, []);
  return { entries, setStatus };
}

function statusIcon(status: EntryStatus) {
  switch (status) {
    case "completed":
      return <Check className="w-5 h-5 text-green-600 dark:text-green-400" />;
    case "skipped":
      return <Minus className="w-5 h-5 text-[var(--muted)]" />;
    case "missed":
      return <Circle className="w-5 h-5 text-[var(--muted)]" />;
    default:
      return <Circle className="w-5 h-5 text-[var(--muted)]" />;
  }
}

function TodayHabitCard({
  habit,
  entry,
  onComplete,
  onSkip,
  onMiss,
}: {
  habit: HabitType;
  entry: HabitEntry | undefined;
  onComplete: (habitId: string) => void;
  onSkip: (habitId: string) => void;
  onMiss: (habitId: string) => void;
}) {
  const status = entry?.status ?? "pending";
  const streak = useMemo(() => computeStreak(habit.id), [habit.id]);

  return (
    <div
      className="rounded-xl border p-4 flex items-center justify-between gap-4"
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl shrink-0">{habit.icon ?? "✨"}</span>
        <div className="min-w-0">
          <p className="font-medium truncate">{habit.name}</p>
          {habit.habitType !== "binary" && (
            <p className="text-sm text-[var(--muted)]">
              {habit.habitType === "quantitative" &&
                `Target: ${habit.targetValue} ${habit.targetUnit}`}
              {habit.habitType === "timed" &&
                `${habit.targetDurationMinutes} min`}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {streak.current > 0 && (
          <span className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
            <Flame className="w-4 h-4" />
            {streak.current}
          </span>
        )}
        {status === "pending" && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onComplete(habit.id)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "hsl(var(--accent))" }}
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => onSkip(habit.id)}
              className="px-3 py-1.5 rounded-lg text-sm border hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: "var(--border)" }}
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => onMiss(habit.id)}
              className="px-3 py-1.5 rounded-lg text-sm text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5"
            >
              Miss
            </button>
          </div>
        )}
        {status !== "pending" && (
          <span className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
            {statusIcon(status)}
            {status}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { entries: todaysEntries, setStatus } = useTodaysEntriesWithOverrides();
  const [habitsList, setHabitsList] = useState<HabitType[]>([]);
  useEffect(() => {
    fetch("/api/habits")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setHabitsList(Array.isArray(data) ? data : dummyHabits));
  }, []);

  const habitsForToday = habitsList.length ? habitsList : dummyHabits;
  const goal = useMemo(() => {
    const total = habitsForToday.filter((h) => {
      const s = h.schedule as { frequency: string; daysOfWeek?: number[] };
      if (s.frequency === "daily") return true;
      if (s.frequency === "weekly" && s.daysOfWeek) {
        const day = new Date(dummyToday).getDay();
        return s.daysOfWeek.includes(day);
      }
      return true;
    }).length;
    const completed = todaysEntries.filter((e) => e.status === "completed").length;
    return { total, completed, percentage: total ? Math.round((completed / total) * 100) : 0 };
  }, [todaysEntries, habitsForToday]);

  const schedule = habitsForToday.filter((h) => {
    const s = h.schedule as { frequency: string; daysOfWeek?: number[] };
    if (s.frequency === "daily") return true;
    if (s.frequency === "weekly" && s.daysOfWeek) {
      const day = new Date(dummyToday).getDay();
      return s.daysOfWeek.includes(day);
    }
    return true;
  });

  const getEntry = (habitId: string) => todaysEntries.find((e) => e.habitId === habitId);

  const handleComplete = (habitId: string) => setStatus(habitId, "completed");
  const handleSkip = (habitId: string) => setStatus(habitId, "skipped");
  const handleMiss = (habitId: string) => setStatus(habitId, "missed");

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const [quote, setQuote] = useState("Progress, not perfection.");
  useEffect(() => {
    setQuote(getQuoteForDate(new Date().toISOString().slice(0, 10)));
  }, []);

  const dashboardMetrics = useMemo(() => {
    const totalHabits = habitsForToday.length;
    let weekCompleted = 0;
    let weekTotal = 0;
    let bestStreak = 0;
    const weekStart = new Date(dummyToday);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    for (const h of habitsForToday) {
      const entries = getEntriesForHabit(h.id);
      const streak = computeStreak(h.id);
      if (streak.longest > bestStreak) bestStreak = streak.longest;
      for (const e of entries) {
        if (e.date >= weekStartStr && e.date <= dummyToday) {
          weekTotal += 1;
          if (e.status === "completed") weekCompleted += 1;
        }
      }
    }
    const weekPct = weekTotal ? Math.round((weekCompleted / weekTotal) * 100) : 0;
    return { totalHabits, weekCompleted, weekTotal, weekPct, bestStreak };
  }, [habitsForToday]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">{greeting}</h1>
        <p className="text-[var(--muted)] mt-1">
          {new Date(dummyToday).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      {/* Intro + motivational quote */}
      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <p className="text-sm text-[var(--muted)] mb-3">
          Welcome back. Track today&apos;s habits below—and remember, skipping or missing a day is okay. What matters is showing up again.
        </p>
        <blockquote className="text-lg font-medium italic border-l-4 pl-4" style={{ borderColor: "hsl(var(--accent))" }}>
          &ldquo;{quote}&rdquo;
        </blockquote>
      </section>

      {/* Dashboard metrics */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <Target className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Habits</span>
          </div>
          <p className="text-2xl font-bold mt-1">{dashboardMetrics.totalHabits}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">Total active</p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">This week</span>
          </div>
          <p className="text-2xl font-bold mt-1">{dashboardMetrics.weekPct}%</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {dashboardMetrics.weekCompleted}/{dashboardMetrics.weekTotal} completed
          </p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Best streak</span>
          </div>
          <p className="text-2xl font-bold mt-1">{dashboardMetrics.bestStreak}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">Longest run</p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <Award className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Today</span>
          </div>
          <p className="text-2xl font-bold mt-1">{goal.completed}/{goal.total}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">Done so far</p>
        </div>
      </section>

      {/* GitHub-style daily activity heatmap */}
      <ActivityHeatmap />

      {/* Daily goal */}
      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Target className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
            Today&apos;s goal
          </h2>
          <span className="text-sm font-medium">
            {goal.completed}/{goal.total} habits
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-[var(--border)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${goal.percentage}%`,
              background: "hsl(var(--accent))",
            }}
          />
        </div>
        {goal.percentage === 100 && goal.total > 0 && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            You did it! All habits for today are done.
          </p>
        )}
      </section>

      {/* Today's habits */}
      <section>
        <h2 className="font-semibold text-lg mb-4">Today&apos;s habits</h2>
        <div className="space-y-3">
          {schedule.length === 0 ? (
            <p className="text-[var(--muted)] py-6 text-center">
              No habits scheduled for today. Add one in Habits.
            </p>
          ) : (
            schedule.map((habit) => (
              <TodayHabitCard
                key={habit.id}
                habit={habit}
                entry={getEntry(habit.id)}
                onComplete={handleComplete}
                onSkip={handleSkip}
                onMiss={handleMiss}
              />
            ))
          )}
        </div>
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/habits"
          className="rounded-xl border p-4 flex items-center justify-between group hover:border-[hsl(var(--accent))] transition-colors"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <span className="font-medium">All habits</span>
          <ChevronRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[hsl(var(--accent))]" />
        </Link>
        <Link
          href="/analytics"
          className="rounded-xl border p-4 flex items-center justify-between group hover:border-[hsl(var(--accent))] transition-colors"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <span className="font-medium">Analytics & insights</span>
          <ChevronRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[hsl(var(--accent))]" />
        </Link>
      </section>
    </div>
  );
}
