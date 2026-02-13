"use client";

import { useState, useEffect } from "react";
import type { Habit, HabitCategory, HabitType, ScheduleConfig } from "@/lib/types";
import {
  CATEGORY_OPTIONS,
  HABIT_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  DAYS_OF_WEEK,
  ICON_OPTIONS,
} from "@/lib/constants";

export interface HabitFormValues {
  name: string;
  description: string;
  motivation: string;
  category: HabitCategory;
  icon: string;
  habitType: HabitType;
  targetValue: number | "";
  targetUnit: string;
  targetDurationMinutes: number | "";
  startDate: string;
  endDate: string;
  frequency: ScheduleConfig["frequency"];
  daysOfWeek: number[];
  intervalDays: number | "";
  timesPerDay: number | "";
}

const defaultValues: HabitFormValues = {
  name: "",
  description: "",
  motivation: "",
  category: "general",
  icon: "✨",
  habitType: "binary",
  targetValue: "",
  targetUnit: "pages",
  targetDurationMinutes: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  frequency: "daily",
  daysOfWeek: [1, 2, 3, 4, 5],
  intervalDays: "",
  timesPerDay: "",
};

function habitToFormValues(habit: Habit): HabitFormValues {
  const s = habit.schedule as ScheduleConfig;
  return {
    name: habit.name,
    description: habit.description ?? "",
    motivation: habit.motivation ?? "",
    category: habit.category,
    icon: habit.icon ?? "✨",
    habitType: habit.habitType,
    targetValue: habit.targetValue ?? "",
    targetUnit: habit.targetUnit ?? "pages",
    targetDurationMinutes: habit.targetDurationMinutes ?? "",
    startDate: habit.startDate.slice(0, 10),
    endDate: habit.endDate?.slice(0, 10) ?? "",
    frequency: s?.frequency ?? "daily",
    daysOfWeek: s?.daysOfWeek ?? [1, 2, 3, 4, 5],
    intervalDays: s?.intervalDays ?? "",
    timesPerDay: s?.timesPerDay ?? "",
  };
}

function formValuesToPayload(values: HabitFormValues) {
  const schedule: ScheduleConfig = {
    frequency: values.frequency,
    daysOfWeek: values.frequency === "weekly" ? values.daysOfWeek : undefined,
    intervalDays: values.frequency === "custom" && values.intervalDays !== "" ? Number(values.intervalDays) : undefined,
    timesPerDay: values.timesPerDay !== "" ? Number(values.timesPerDay) : undefined,
  };
  return {
    name: values.name.trim(),
    description: values.description.trim() || null,
    motivation: values.motivation.trim() || null,
    category: values.category,
    icon: values.icon || null,
    habitType: values.habitType,
    targetValue: values.habitType === "quantitative" && values.targetValue !== "" ? Number(values.targetValue) : null,
    targetUnit: values.habitType === "quantitative" ? values.targetUnit.trim() || null : null,
    targetDurationMinutes: values.habitType === "timed" && values.targetDurationMinutes !== "" ? Number(values.targetDurationMinutes) : null,
    startDate: values.startDate,
    endDate: values.endDate ? values.endDate : null,
    schedule,
  };
}

interface HabitFormProps {
  initialHabit?: Habit | null;
  onSubmit: (payload: ReturnType<typeof formValuesToPayload>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function HabitForm({
  initialHabit,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: HabitFormProps) {
  const [values, setValues] = useState<HabitFormValues>(defaultValues);

  useEffect(() => {
    setValues(initialHabit ? habitToFormValues(initialHabit) : defaultValues);
  }, [initialHabit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) return;
    await onSubmit(formValuesToPayload(values));
  };

  const toggleDay = (d: number) => {
    setValues((v) => ({
      ...v,
      daysOfWeek: v.daysOfWeek.includes(d) ? v.daysOfWeek.filter((x) => x !== d) : [...v.daysOfWeek, d].sort((a, b) => a - b),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder="e.g. Drink Water"
          className="w-full px-3 py-2 rounded-lg border bg-transparent"
          style={{ borderColor: "var(--border)" }}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="What is this habit?"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border bg-transparent resize-none"
          style={{ borderColor: "var(--border)" }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Motivation (why it matters)</label>
        <input
          type="text"
          value={values.motivation}
          onChange={(e) => setValues((v) => ({ ...v, motivation: e.target.value }))}
          placeholder="e.g. Energy and focus"
          className="w-full px-3 py-2 rounded-lg border bg-transparent"
          style={{ borderColor: "var(--border)" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={values.category}
            onChange={(e) => setValues((v) => ({ ...v, category: e.target.value as HabitCategory }))}
            className="w-full px-3 py-2 rounded-lg border bg-transparent"
            style={{ borderColor: "var(--border)" }}
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Icon</label>
          <div className="flex flex-wrap gap-1">
            {ICON_OPTIONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setValues((v) => ({ ...v, icon }))}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors ${
                  values.icon === icon ? "ring-2 ring-[hsl(var(--accent))]" : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          value={values.habitType}
          onChange={(e) => setValues((v) => ({ ...v, habitType: e.target.value as HabitType }))}
          className="w-full px-3 py-2 rounded-lg border bg-transparent"
          style={{ borderColor: "var(--border)" }}
        >
          {HABIT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {values.habitType === "quantitative" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Target value</label>
            <input
              type="number"
              min={1}
              value={values.targetValue}
              onChange={(e) => setValues((v) => ({ ...v, targetValue: e.target.value === "" ? "" : Number(e.target.value) }))}
              placeholder="30"
              className="w-full px-3 py-2 rounded-lg border bg-transparent"
              style={{ borderColor: "var(--border)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <input
              type="text"
              value={values.targetUnit}
              onChange={(e) => setValues((v) => ({ ...v, targetUnit: e.target.value }))}
              placeholder="pages, steps, etc."
              className="w-full px-3 py-2 rounded-lg border bg-transparent"
              style={{ borderColor: "var(--border)" }}
            />
          </div>
        </div>
      )}

      {values.habitType === "timed" && (
        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <input
            type="number"
            min={1}
            value={values.targetDurationMinutes}
            onChange={(e) => setValues((v) => ({ ...v, targetDurationMinutes: e.target.value === "" ? "" : Number(e.target.value) }))}
            placeholder="15"
            className="w-full px-3 py-2 rounded-lg border bg-transparent max-w-[120px]"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Schedule</label>
        <select
          value={values.frequency}
          onChange={(e) => setValues((v) => ({ ...v, frequency: e.target.value as HabitFormValues["frequency"] }))}
          className="w-full px-3 py-2 rounded-lg border bg-transparent mb-2"
          style={{ borderColor: "var(--border)" }}
        >
          {FREQUENCY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {values.frequency === "weekly" && (
          <div className="flex flex-wrap gap-2 mt-2">
            {DAYS_OF_WEEK.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDay(d.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  values.daysOfWeek.includes(d.value)
                    ? "text-white"
                    : "border"
                }`}
                style={
                  values.daysOfWeek.includes(d.value)
                    ? { background: "hsl(var(--accent))" }
                    : { borderColor: "var(--border)" }
                }
              >
                {d.label}
              </button>
            ))}
          </div>
        )}
        {values.frequency === "custom" && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-[var(--muted)]">Every</span>
            <input
              type="number"
              min={1}
              value={values.intervalDays}
              onChange={(e) => setValues((v) => ({ ...v, intervalDays: e.target.value === "" ? "" : Number(e.target.value) }))}
              placeholder="2"
              className="w-16 px-2 py-1.5 rounded-lg border bg-transparent text-sm"
              style={{ borderColor: "var(--border)" }}
            />
            <span className="text-sm text-[var(--muted)]">days</span>
          </div>
        )}
        {(values.frequency === "daily" || values.frequency === "weekly") && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-[var(--muted)]">Times per day</span>
            <input
              type="number"
              min={1}
              value={values.timesPerDay}
              onChange={(e) => setValues((v) => ({ ...v, timesPerDay: e.target.value === "" ? "" : Number(e.target.value) }))}
              placeholder="1"
              className="w-16 px-2 py-1.5 rounded-lg border bg-transparent text-sm"
              style={{ borderColor: "var(--border)" }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start date</label>
          <input
            type="date"
            value={values.startDate}
            onChange={(e) => setValues((v) => ({ ...v, startDate: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border bg-transparent"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End date (optional)</label>
          <input
            type="date"
            value={values.endDate}
            onChange={(e) => setValues((v) => ({ ...v, endDate: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border bg-transparent"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
          style={{ borderColor: "var(--border)" }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!values.name.trim() || isSubmitting}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "hsl(var(--accent))" }}
        >
          {isSubmitting ? "Saving…" : initialHabit ? "Save changes" : "Add habit"}
        </button>
      </div>
    </form>
  );
}
