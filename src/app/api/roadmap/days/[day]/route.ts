import { NextResponse } from "next/server";
import { getDayByNumber } from "@/lib/nestjs-roadmap-data";
import {
  getDayProgress,
  updateBlockStatus,
  updateDayNotes,
  checkDayAccess,
  getRoadmapOverview,
} from "@/lib/roadmap-store";
import type { EntryStatus, TimeBlockId } from "@/lib/types";

const VALID_BLOCKS: TimeBlockId[] = ["learn", "rebuild", "build", "test"];
const VALID_STATUSES: EntryStatus[] = ["pending", "completed", "skipped", "missed"];

function lockedResponse(dayNumber: number) {
  const access = checkDayAccess(dayNumber);
  return NextResponse.json(
    {
      error: access.message,
      locked: true,
      requiredDay: access.requiredDay,
    },
    { status: 403 },
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ day: string }> },
) {
  const { day } = await params;
  const dayNumber = Number.parseInt(day, 10);
  const curriculum = getDayByNumber(dayNumber);
  const progress = getDayProgress(dayNumber);

  if (!curriculum || !progress) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 });
  }

  const access = checkDayAccess(dayNumber);
  if (!access.allowed) {
    return lockedResponse(dayNumber);
  }

  return NextResponse.json({
    day: curriculum,
    progress,
    unlocked: true,
    currentDay: getRoadmapOverview().currentDay,
    streaks: getRoadmapOverview().streaks,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ day: string }> },
) {
  const { day } = await params;
  const dayNumber = Number.parseInt(day, 10);

  const access = checkDayAccess(dayNumber);
  if (!access.allowed) {
    return lockedResponse(dayNumber);
  }

  const body = await req.json();

  if (body.blockId && body.status) {
    if (!VALID_BLOCKS.includes(body.blockId)) {
      return NextResponse.json({ error: "Invalid block" }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const updated = updateBlockStatus(dayNumber, body.blockId, body.status);
    if (!updated) return NextResponse.json({ error: "Day not found" }, { status: 404 });
    return NextResponse.json(updated);
  }

  const updated = updateDayNotes(dayNumber, {
    notes: body.notes,
    builtItems: body.builtItems,
    learnNotes: body.learnNotes,
    dayCompleted: body.dayCompleted,
  });
  if (!updated) return NextResponse.json({ error: "Day not found" }, { status: 404 });
  return NextResponse.json(updated);
}
