import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/prisma";
import { upsertEntry, todayString } from "@/lib/habits-db";
import { dummyToday } from "@/lib/dummy-data";
import { setEntry } from "@/lib/api-store";
import type { EntryStatus } from "@/lib/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: habitId } = await params;
  const body = await req.json().catch(() => ({}));
  const status: EntryStatus = body?.status ?? "completed";
  if (!["completed", "missed", "skipped"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const date = body?.date ?? todayString();

  if (!isDatabaseConfigured()) {
    const entry = setEntry(habitId, date === todayString() ? dummyToday : date, status);
    return NextResponse.json(entry);
  }

  try {
    const entry = await upsertEntry(habitId, date, status);
    if (!entry) return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    return NextResponse.json(entry);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
