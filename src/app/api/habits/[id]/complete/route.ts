import { NextResponse } from "next/server";
import { dummyToday } from "@/lib/dummy-data";
import { setEntry } from "@/lib/api-store";
import type { EntryStatus } from "@/lib/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: habitId } = await params;
  const body = await req.json().catch(() => ({}));
  const status: EntryStatus = body?.status ?? "completed";
  if (!["completed", "missed", "skipped"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const entry = setEntry(habitId, dummyToday, status);
  return NextResponse.json(entry);
}
