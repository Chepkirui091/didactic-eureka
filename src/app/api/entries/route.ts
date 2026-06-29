import { NextResponse } from "next/server";
import { jsonWithSource, resolveDataSource, withDatabase } from "@/lib/api-db";
import {
  getEntriesForDateStr,
  getEntriesForHabitId,
  getAllEntriesSince,
  getActivityCountByDate,
  todayString,
} from "@/lib/habits-db";
import {
  dummyEntries,
  getEntriesForHabit,
  getEntriesForDate,
  getActivityCountByDate as dummyActivity,
} from "@/lib/dummy-data";

function fallbackEntries(req: Request) {
  const { searchParams } = new URL(req.url);
  const habitId = searchParams.get("habitId");
  const date = searchParams.get("date");
  const daysBack = searchParams.get("daysBack");
  const activity = searchParams.get("activity");

  if (activity) {
    const days = Number.parseInt(activity, 10) || 98;
    return Object.fromEntries(dummyActivity(days));
  }
  if (habitId) return getEntriesForHabit(habitId);
  if (date) {
    const d = date === "today" ? todayString() : date;
    return getEntriesForDate(d);
  }
  if (daysBack) {
    const days = Number.parseInt(daysBack, 10) || 60;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().slice(0, 10);
    return dummyEntries.filter((e) => e.date >= sinceStr);
  }
  return getEntriesForDate(todayString());
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const habitId = searchParams.get("habitId");
  const date = searchParams.get("date");
  const daysBack = searchParams.get("daysBack");
  const activity = searchParams.get("activity");

  const source = await resolveDataSource();
  if (source === "fallback") {
    return jsonWithSource(fallbackEntries(req), "fallback");
  }

  const result = await withDatabase(async () => {
    if (activity) {
      const days = Number.parseInt(activity, 10) || 98;
      return getActivityCountByDate(days);
    }
    if (habitId) return getEntriesForHabitId(habitId);
    if (date) {
      const d = date === "today" ? todayString() : date;
      return getEntriesForDateStr(d);
    }
    if (daysBack) {
      const days = Number.parseInt(daysBack, 10) || 60;
      return getAllEntriesSince(days);
    }
    return getEntriesForDateStr(todayString());
  });

  if (!result.ok) {
    return jsonWithSource(fallbackEntries(req), "fallback");
  }
  return jsonWithSource(result.value, "database");
}
