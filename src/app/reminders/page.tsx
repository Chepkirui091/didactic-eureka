"use client";

import { Bell, Clock, MessageSquare } from "lucide-react";
import { dummyReminders, dummyHabits } from "@/lib/dummy-data";

export default function RemindersPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Reminders</h1>
        <p className="text-[var(--muted)] mt-1">
          Smart reminders that stop when you&apos;re done. End-of-day recap available.
        </p>
      </header>

      <div className="space-y-4">
        {dummyReminders.map((r) => {
          const habit = r.habitId
            ? dummyHabits.find((h) => h.id === r.habitId)
            : null;
          return (
            <div
              key={r.id}
              className="rounded-xl border p-4 flex items-center gap-4"
              style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "hsl(var(--accent) / 0.2)" }}
              >
                <Bell className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">
                  {habit ? habit.name : "General"}
                </p>
                <p className="text-sm text-[var(--muted)] flex items-center gap-1 mt-0.5">
                  <Clock className="w-4 h-4" />
                  {r.time}
                  {r.message && (
                    <>
                      <span className="mx-1">·</span>
                      <MessageSquare className="w-4 h-4" />
                      {r.message}
                    </>
                  )}
                </p>
              </div>
              <label className="flex items-center gap-2 shrink-0">
                <input
                  type="checkbox"
                  defaultChecked={r.enabled}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">On</span>
              </label>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-xl border p-4 text-sm text-[var(--muted)]"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="font-medium text-[var(--foreground)]">Notification intelligence</p>
        <p className="mt-1">
          Reminders can be set to stop once the habit is completed for the day. End-of-day recap reminds you to log any remaining habits.
        </p>
      </div>
    </div>
  );
}
