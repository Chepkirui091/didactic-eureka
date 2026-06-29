import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/prisma";
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const habitId = searchParams.get("habitId");
  const date = searchParams.get("date");
  const daysBack = searchParams.get("daysBack");
  const activity = searchParams.get("activity");

  if (!isDatabaseConfigured()) {
    if (activity) {
      const days = Number.parseInt(activity, 10) || 98;
      const map = dummyActivity(days);
      return NextResponse.json(Object.fromEntries(map));
    }
    if (habitId) {
      return NextResponse.json(getEntriesForHabit(habitId));
    }
    if (date) {
      const d = date === "today" ? todayString() : date;
      return NextResponse.json(getEntriesForDate(d));
    }
    if (daysBack) {
      const days = Number.parseInt(daysBack, 10) || 60;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().slice(0, 10);
      return NextResponse.json(
        dummyEntries.filter((e) => e.date >= sinceStr),
      );
    }
    return NextResponse.json(getEntriesForDate(todayString()));
  }

  try {
    if (activity) {
      const days = Number.parseInt(activity, 10) || 98;
      const counts = await getActivityCountByDate(days);
      return NextResponse.json(counts);
    }
    if (habitId) {
      const entries = await getEntriesForHabitId(habitId);
      return NextResponse.json(entries);
    }
    if (date) {
      const d = date === "today" ? todayString() : date;
      const entries = await getEntriesForDateStr(d);
      return NextResponse.json(entries);
    }
    if (daysBack) {
      const days = Number.parseInt(daysBack, 10) || 60;
      const entries = await getAllEntriesSince(days);
      return NextResponse.json(entries);
    }
    const entries = await getEntriesForDateStr(todayString());
    return NextResponse.json(entries);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
