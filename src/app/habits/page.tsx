"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Flame, ChevronRight, GripVertical, Pencil, Trash2 } from "lucide-react";
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

function HabitRow({
  habit,
  entries,
  onEdit,
  onDelete,
}: {
  habit: HabitType;
  entries: HabitEntry[];
  onEdit: (h: HabitType) => void;
  onDelete: (h: HabitType) => void;
}) {
  const streak = computeStreakFromEntries(entries);
  const completed = entries.filter((e) => e.status === "completed").length;
  const total = entries.length;
  const rate = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className="rounded-xl border p-4 flex items-center gap-4 group"
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
    >
      <span className="text-[var(--muted)] cursor-grab touch-none" aria-hidden>
        <GripVertical className="w-5 h-5" />
      </span>
      <Link href={`/habits/${habit.id}`} className="flex-1 min-w-0 flex items-center gap-3">
        <span className="text-2xl shrink-0">{habit.icon ?? "✨"}</span>
        <div className="min-w-0">
          <p className="font-medium truncate">{habit.name}</p>
          <p className="text-sm text-[var(--muted)]">
            {CATEGORY_LABELS[habit.category] ?? habit.category} · {rate}% completion
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-2 shrink-0">
        {streak.current > 0 && (
          <span className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
            <Flame className="w-4 h-4" />
            {streak.current} day streak
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onEdit(habit);
          }}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--muted)] hover:text-[var(--foreground)]"
          aria-label="Edit habit"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onDelete(habit);
          }}
          className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-red-600 dark:hover:text-red-400"
          aria-label="Delete habit"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <Link
          href={`/habits/${habit.id}`}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--muted)] group-hover:text-[hsl(var(--accent))]"
          aria-label="View habit"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitType[]>([]);
  const [allEntries, setAllEntries] = useState<HabitEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitType | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<HabitType | null>(null);

  const fetchHabits = useCallback(async () => {
    const [habitsRes, entriesRes] = await Promise.all([
      fetch("/api/habits"),
      fetch("/api/entries?daysBack=60"),
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

  useLiveRefresh(fetchHabits, [fetchHabits]);

  const openAdd = () => {
    setEditingHabit(null);
    setModalOpen(true);
  };

  const openEdit = (habit: HabitType) => {
    setEditingHabit(habit);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingHabit(null);
  };

  const handleDeleteClick = (habit: HabitType) => {
    setHabitToDelete(habit);
  };

  const handleDeleteConfirm = async () => {
    if (!habitToDelete) return;
    const res = await fetch(`/api/habits/${habitToDelete.id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    fetchHabits();
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Habits</h1>
          <p className="text-[var(--muted)] mt-1">
            Manage your habits and track consistency.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "hsl(var(--accent))" }}
        >
          <Plus className="w-5 h-5" />
          Add habit
        </button>
      </header>

      <div className="space-y-3">
        {habits.length === 0 ? (
          <div
            className="rounded-xl border border-dashed p-12 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-[var(--muted)] mb-4">No habits yet.</p>
            <button
              type="button"
              onClick={openAdd}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ background: "hsl(var(--accent))" }}
            >
              Add your first habit
            </button>
          </div>
        ) : (
          habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              entries={allEntries.filter((e) => e.habitId === habit.id)}
              onEdit={openEdit}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </div>

      <HabitFormModal
        open={modalOpen}
        onClose={closeModal}
        initialHabit={editingHabit}
        onSuccess={fetchHabits}
      />

      <ConfirmDialog
        open={!!habitToDelete}
        onClose={() => setHabitToDelete(null)}
        title="Delete habit?"
        message={
          habitToDelete
            ? `Are you sure you want to delete "${habitToDelete.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Yes, delete"
        cancelLabel="Cancel"
        variant="danger"
        successTitle="Deleted"
        successMessage="The habit has been removed."
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
