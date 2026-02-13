"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { HabitForm } from "./habit-form";
import type { Habit } from "@/lib/types";

interface HabitFormModalProps {
  open: boolean;
  onClose: () => void;
  initialHabit?: Habit | null;
  onSuccess: () => void;
}

export function HabitFormModal({
  open,
  onClose,
  initialHabit,
  onSuccess,
}: HabitFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      if (initialHabit) {
        const res = await fetch(`/api/habits/${initialHabit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update");
      } else {
        const res = await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create");
      }
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="habit-form-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-xl"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-inherit z-10" style={{ borderColor: "var(--border)" }}>
          <h2 id="habit-form-title" className="text-lg font-semibold">
            {initialHabit ? "Edit habit" : "Add habit"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--muted)]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <HabitForm
            initialHabit={initialHabit ?? undefined}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
