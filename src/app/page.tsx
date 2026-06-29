"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Flame, Target, ChevronRight, TrendingUp, Award, Compass } from "lucide-react";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { EntryActionsMenu } from "@/components/entry-actions-menu";
import {
  dummyHabits,
  getTodaysEntries,
  dummyToday,
  computeStreak,
  getEntriesForHabit,
} from "@/lib/dummy-data";
import { getQuoteForDate } from "@/lib/quotes";
import type { Habit as HabitType, HabitEntry, EntryStatus, RoadmapOverview } from "@/lib/types";

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
      className="rounded-xl border p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4"
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <span className="text-xl sm:text-2xl shrink-0">{habit.icon ?? "✨"}</span>
        <div className="min-w-0">
          <p className="font-medium truncate text-sm sm:text-base">{habit.name}</p>
          {habit.habitType !== "binary" && (
            <p className="text-xs sm:text-sm text-[var(--muted)] truncate">
              {habit.habitType === "quantitative" &&
                `Target: ${habit.targetValue} ${habit.targetUnit}`}
              {habit.habitType === "timed" &&
                `${habit.targetDurationMinutes} min`}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {streak.current > 0 && (
          <span className="flex items-center gap-1 text-xs sm:text-sm text-amber-600 dark:text-amber-400">
            <Flame className="w-4 h-4" />
            {streak.current}
          </span>
        )}
        <EntryActionsMenu
          status={status}
          onComplete={() => onComplete(habit.id)}
          onSkip={() => onSkip(habit.id)}
          onMiss={() => onMiss(habit.id)}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { entries: todaysEntries, setStatus } = useTodaysEntriesWithOverrides();
  const [habitsList, setHabitsList] = useState<HabitType[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    if (!mounted) return "Welcome";
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, [mounted]);

  const dateLabel = useMemo(() => {
    if (!mounted) return "";
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, [mounted]);

  const [quote, setQuote] = useState("Progress, not perfection.");
  useEffect(() => {
    setQuote(getQuoteForDate(new Date().toISOString().slice(0, 10)));
  }, []);

  const [roadmap, setRoadmap] = useState<RoadmapOverview | null>(null);
  useEffect(() => {
    fetch("/api/roadmap")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setRoadmap(data));
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
        <p className="text-[var(--muted)] mt-1" suppressHydrationWarning>
          {dateLabel || "\u00a0"}
        </p>
      </header>

      {/* Intro + motivational quote */}
      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <p className="text-sm text-[var(--muted)] mb-3">
          Welcome back. Track today&apos;s habits below and remember, skipping or missing a day is okay. What matters is showing up again.
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

      {/* NestJS roadmap today */}
      {roadmap && (
        <section
          className="rounded-xl border p-5"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Compass className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
              NestJS Roadmap - Day {roadmap.currentDay}
            </h2>
            <Link
              href={`/roadmap/${roadmap.currentDay}`}
              className="text-sm font-medium flex items-center gap-1 hover:underline"
              style={{ color: "hsl(var(--accent))" }}
            >
              Open day <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {(() => {
            const day = roadmap.days.find((d) => d.dayNumber === roadmap.currentDay);
            const prog = roadmap.progress.find((p) => p.dayNumber === roadmap.currentDay);
            if (!day || !prog) return null;
            const blocksDone = roadmap.timeBlocks.filter(
              (b) => prog.blocks[b.id] === "completed",
            ).length;
            return (
              <>
                <p className="text-sm font-medium">{day.title}</p>
                <p className="text-sm text-[var(--muted)] mt-1 line-clamp-2">{day.task}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 h-2 rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(blocksDone / roadmap.timeBlocks.length) * 100}%`,
                        background: "hsl(var(--accent))",
                      }}
                    />
                  </div>
                  <span className="text-xs text-[var(--muted)] shrink-0">
                    {blocksDone}/{roadmap.timeBlocks.length} blocks
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {roadmap.streaks.study.current > 0 && (
                    <span className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                      <Flame className="w-4 h-4" />
                      {roadmap.streaks.study.current} day study streak
                    </span>
                  )}
                  {roadmap.streaks.days.current > 0 && (
                    <span className="text-xs text-[var(--muted)]">
                      {roadmap.streaks.days.current} roadmap day
                      {roadmap.streaks.days.current === 1 ? "" : "s"} in a row
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--muted)] mt-2">
                  Learn 5:30–7:30 · Rebuild 9:30–10 · Build 7:30–9:30 · Test 9:30–10
                </p>
              </>
            );
          })()}
        </section>
      )}

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
          href="/roadmap"
          className="rounded-xl border p-4 flex items-center justify-between group hover:border-[hsl(var(--accent))] transition-colors"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <span className="font-medium">NestJS 30-day roadmap</span>
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
