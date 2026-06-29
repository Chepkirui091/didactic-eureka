"use client";

import { useEffect, useMemo, useState } from "react";

const WEEKS = 14;
const DAYS_TOTAL = WEEKS * 7;

function getHeatLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (maxCount <= 0) return 0;
  const pct = count / maxCount;
  if (pct <= 0.25) return 1;
  if (pct <= 0.5) return 2;
  if (pct <= 0.75) return 3;
  return 4;
}

export function ActivityHeatmap() {
  const [activity, setActivity] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = () => {
      fetch(`/api/entries?activity=${DAYS_TOTAL}`)
        .then((r) => (r.ok ? r.json() : {}))
        .then((data) => setActivity(data ?? {}));
    };
    load();
    const timer = setInterval(load, 20_000);
    return () => clearInterval(timer);
  }, []);

  const { cells, maxCount } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const start = new Date(today);
    start.setDate(start.getDate() - DAYS_TOTAL + 1);
    start.setDate(start.getDate() - start.getDay());
    const dates: string[] = [];
    for (let i = 0; i < DAYS_TOTAL; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    let max = 0;
    for (const date of dates) {
      const c = activity[date] ?? 0;
      if (c > max) max = c;
    }
    const cells = dates.map((date) => ({
      date,
      count: activity[date] ?? 0,
      level: getHeatLevel(activity[date] ?? 0, max || 1),
    }));
    return { cells, maxCount: max };
  }, [activity]);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-xl border p-4" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
      <h2 className="font-semibold text-sm mb-3">Activity (last {WEEKS} weeks)</h2>
      <div className="flex gap-1 items-start">
        <div className="flex flex-col gap-0.5 text-xs text-[var(--muted)] shrink-0 pt-1.5">
          {dayLabels.map((l) => (
            <span key={l} className="h-3 flex items-center" style={{ width: 24 }}>
              {l}
            </span>
          ))}
        </div>
        <div className="flex gap-0.5 overflow-x-auto pb-1">
          {Array.from({ length: WEEKS }, (_, col) => (
            <div key={col} className="flex flex-col gap-0.5">
              {Array.from({ length: 7 }, (_, row) => {
                const idx = col * 7 + row;
                const cell = cells[idx];
                if (!cell) return null;
                const isToday = cell.date === new Date().toISOString().slice(0, 10);
                return (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-sm shrink-0 ${isToday ? "ring-1 ring-[var(--foreground)]" : ""}`}
                    style={{
                      background:
                        cell.level === 0
                          ? "var(--border)"
                          : `hsl(var(--accent) / ${0.2 + cell.level * 0.2})`,
                    }}
                    title={`${cell.date}: ${cell.count} completed`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-2 text-xs text-[var(--muted)]">
        <span>Less</span>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{
                background:
                  level === 0 ? "var(--border)" : `hsl(var(--accent) / ${0.2 + level * 0.2})`,
              }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
