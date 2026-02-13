"use client";

import { useMemo } from "react";
import { BarChart3, Calendar, Lightbulb } from "lucide-react";
import {
  dummyHabits,
  getEntriesForHabit,
  computeStreak,
  dummyToday,
  dummyEntries,
} from "@/lib/dummy-data";

export default function AnalyticsPage() {
  const habitsWithStats = useMemo(() => {
    return dummyHabits.map((h) => {
      const entries = getEntriesForHabit(h.id);
      const completed = entries.filter((e) => e.status === "completed").length;
      const total = entries.length;
      const rate = total ? Math.round((completed / total) * 100) : 0;
      const streak = computeStreak(h.id);
      return {
        ...h,
        completionRate: rate,
        completed,
        total,
        streakCurrent: streak.current,
        streakLongest: streak.longest,
      };
    });
  }, []);

  const mostSkipped = useMemo(() => {
    const byHabit = new Map<string, number>();
    for (const e of dummyEntries) {
      if (e.status === "skipped") {
        byHabit.set(e.habitId, (byHabit.get(e.habitId) ?? 0) + 1);
      }
    }
    return [...byHabit.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([habitId]) => dummyHabits.find((h) => h.id === habitId)?.name ?? habitId);
  }, []);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const byWeekday = useMemo(() => {
    const count = [0, 0, 0, 0, 0, 0, 0];
    for (const e of dummyEntries) {
      if (e.status === "completed") {
        const d = new Date(e.date).getDay();
        count[d]++;
      }
    }
    return count;
  }, []);

  const maxWeekday = Math.max(...byWeekday, 1);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Analytics & insights</h1>
        <p className="text-[var(--muted)] mt-1">
          Understand your patterns and improve consistency.
        </p>
      </header>

      {/* Completion by habit */}
      <section>
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
          Completion by habit
        </h2>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {habitsWithStats.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-4 p-4"
              >
                <span className="text-xl shrink-0">{h.icon ?? "✨"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{h.name}</p>
                  <div className="h-2 rounded-full bg-[var(--border)] mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${h.completionRate}%`,
                        background: "hsl(var(--accent))",
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium shrink-0">
                  {h.completionRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly pattern */}
      <section>
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
          Weekly pattern
        </h2>
        <p className="text-sm text-[var(--muted)] mb-3">
          When you complete habits most (last 60 days).
        </p>
        <div className="flex gap-2 items-end h-32">
          {weekdays.map((day, i) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t transition-all min-h-[4px]"
                style={{
                  height: `${(byWeekday[i] / maxWeekday) * 100}%`,
                  background: "hsl(var(--accent))",
                }}
              />
              <span className="text-xs text-[var(--muted)]">{day}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Insights */}
      <section>
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
          Insights
        </h2>
        <div className="space-y-3">
          {mostSkipped.length > 0 && (
            <div
              className="rounded-xl border p-4"
              style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
            >
              <p className="text-sm font-medium">Most skipped habits</p>
              <p className="text-sm text-[var(--muted)] mt-1">
                Consider reducing frequency or pairing with an anchor habit:{" "}
                {mostSkipped.join(", ")}.
              </p>
            </div>
          )}
          <div
            className="rounded-xl border p-4"
            style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
          >
            <p className="text-sm font-medium">Recommendation</p>
            <p className="text-sm text-[var(--muted)] mt-1">
              You have {dummyHabits.length} habits. If you feel overloaded, try focusing on 3–5 at a time and add more once they feel automatic.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
