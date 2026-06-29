import { NextResponse } from "next/server";
import { jsonWithSource, resolveDataSource, withDatabase } from "@/lib/api-db";
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
  const source = await resolveDataSource();

  if (source === "fallback") {
    const entry = setEntry(habitId, date === todayString() ? dummyToday : date, status);
    return jsonWithSource(entry, "fallback");
  }

  const result = await withDatabase(() => upsertEntry(habitId, date, status));
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 503 });
  }
  if (!result.value) return NextResponse.json({ error: "Habit not found" }, { status: 404 });
  return jsonWithSource(result.value, "database");
}
