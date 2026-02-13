"use client";

import { Trophy, Lock } from "lucide-react";
import { dummyBadges } from "@/lib/dummy-data";

export default function AchievementsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-[var(--muted)] mt-1">
          Badges and milestones. Celebrate progress without guilt.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dummyBadges.map((badge) => {
          const earned = !!badge.earnedAt;
          return (
            <div
              key={badge.id}
              className={`rounded-xl border p-5 ${
                earned ? "" : "opacity-75"
              }`}
              style={{
                background: "var(--card)",
                borderColor: "var(--card-border)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
                    earned ? "" : "grayscale"
                  }`}
                  style={{ background: "hsl(var(--accent) / 0.2)" }}
                >
                  {badge.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium flex items-center gap-2">
                    {badge.name}
                    {!earned && <Lock className="w-4 h-4 text-[var(--muted)]" />}
                  </p>
                  <p className="text-sm text-[var(--muted)] mt-0.5">
                    {badge.description}
                  </p>
                  {earned && badge.earnedAt && (
                    <p className="text-xs text-[var(--muted)] mt-2">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-xl border p-4 text-sm text-[var(--muted)]"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="font-medium text-[var(--foreground)]">Daily goals</p>
        <p className="mt-1">
          Completing all habits scheduled for the day counts toward your daily goal score. Streaks and consistency unlock badges over time.
        </p>
      </div>
    </div>
  );
}
