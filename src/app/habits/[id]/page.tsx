"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flame, Calendar, Target, Pencil, Trash2 } from "lucide-react";
import { computeStreakFromEntries, todayString } from "@/lib/streak";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import { HabitFormModal } from "@/components/habit-form-modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Habit as HabitType, HabitEntry } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  health: "Health",
  work: "Work",
  learning: "Learning",
  finance: "Finance",
  mental: "Mental",
  general: "General",
};

// Simple heatmap: last 12 weeks, 7 days per row
function Heatmap({ entries }: { entries: HabitEntry[] }) {
  const completedSet = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      if (e.status === "completed") set.add(e.date);
    }
    return set;
  }, [entries]);

  const days = useMemo(() => {
    const out: { date: string; completed: boolean }[] = [];
    const end = new Date(todayString());
    for (let i = 83; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      out.push({
        date: d.toISOString().slice(0, 10),
        completed: completedSet.has(d.toISOString().slice(0, 10)),
      });
    }
    return out;
  }, [completedSet]);

  return (
    <div className="flex flex-wrap gap-1" style={{ maxWidth: 360 }}>
      {days.map((d) => (
        <div
          key={d.date}
          className={`w-3 h-3 rounded-sm ${d.completed ? "heat-3" : "heat-0"}`}
          title={`${d.date}: ${d.completed ? "Done" : "Not done"}`}
        />
      ))}
    </div>
  );
}

export default function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [habit, setHabit] = useState<HabitType | null>(null);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    Promise.resolve(params).then(setResolvedParams);
  }, [params]);

  const id = resolvedParams?.id;

  const fetchHabit = useCallback(async () => {
    if (!id) return;
    const [habitRes, entriesRes] = await Promise.all([
      fetch(`/api/habits/${id}`),
      fetch(`/api/entries?habitId=${id}`),
    ]);
    if (habitRes.ok) {
      setHabit(await habitRes.json());
    } else {
      setHabit(null);
    }
    if (entriesRes.ok) {
      const data = await entriesRes.json();
      setEntries(Array.isArray(data) ? data : []);
    }
  }, [id]);

  useLiveRefresh(fetchHabit, [fetchHabit]);

  const streak = habit ? computeStreakFromEntries(entries) : { current: 0, longest: 0 };
  const completed = entries.filter((e) => e.status === "completed").length;
  const total = entries.length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  if (!id) {
    return (
      <div className="space-y-6">
        <Link
          href="/habits"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to habits
        </Link>
        <p>Habit not found.</p>
      </div>
    );
  }

  if (habit === null) {
    return (
      <div className="space-y-6">
        <Link
          href="/habits"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to habits
        </Link>
        <p className="text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  const s = habit.schedule as { frequency: string; daysOfWeek?: number[] };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/habits"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to habits
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: "var(--border)" }}
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <header className="flex items-start gap-4">
        <span className="text-4xl shrink-0">{habit.icon ?? "✨"}</span>
        <div>
          <h1 className="text-2xl font-bold">{habit.name}</h1>
          <p className="text-[var(--muted)] mt-1">
            {CATEGORY_LABELS[habit.category] ?? habit.category}
          </p>
          {habit.description && (
            <p className="mt-2 text-sm">{habit.description}</p>
          )}
          {habit.motivation && (
            <p className="mt-1 text-sm italic text-[var(--muted)]">
              &ldquo;{habit.motivation}&rdquo;
            </p>
          )}
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Flame className="w-5 h-5" />
            <span className="font-semibold">{streak.current}</span>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">Current streak</p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="font-semibold">{streak.longest}</div>
          <p className="text-sm text-[var(--muted)] mt-1">Longest streak</p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="font-semibold">{completionRate}%</div>
          <p className="text-sm text-[var(--muted)] mt-1">Completion rate</p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="font-semibold">
            {s.frequency === "daily"
              ? "Daily"
              : s.frequency === "weekly"
                ? `Mon/Wed/Fri`
                : s.frequency}
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">Schedule</p>
        </div>
      </div>

      {/* Activity heatmap */}
      <section>
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
          Activity
        </h2>
        <Heatmap entries={entries} />
        <p className="text-xs text-[var(--muted)] mt-2">
          Last 84 days · darker = completed
        </p>
      </section>

      {/* Target for quantitative/timed */}
      {(habit.habitType === "quantitative" || habit.habitType === "timed") && (
        <section>
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <Target className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
            Target
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {habit.habitType === "quantitative" &&
              `${habit.targetValue} ${habit.targetUnit} per day`}
            {habit.habitType === "timed" &&
              `${habit.targetDurationMinutes} minutes per day`}
          </p>
        </section>
      )}

      <HabitFormModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        initialHabit={habit}
        onSuccess={() => { setEditModalOpen(false); fetchHabit(); }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onSuccess={() => router.push("/habits")}
        title="Delete habit?"
        message={
          habit
            ? `Are you sure you want to delete "${habit.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Yes, delete"
        cancelLabel="Cancel"
        variant="danger"
        successTitle="Deleted"
        successMessage="The habit has been removed."
        onConfirm={async () => {
          if (!habit) return;
          const res = await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to delete");
        }}
      />
    </div>
  );
}
