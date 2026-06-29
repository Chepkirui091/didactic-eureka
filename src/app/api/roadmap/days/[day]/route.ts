import { NextResponse } from "next/server";
import { getDayByNumber } from "@/lib/nestjs-roadmap-data";
import {
  getDayProgress,
  updateBlockStatus,
  updateDayNotes,
  checkDayAccess,
  getRoadmapOverview,
} from "@/lib/roadmap-store";
import {
  getDayProgressDb,
  updateBlockStatusDb,
  updateDayNotesDb,
  checkDayAccessDb,
  getRoadmapOverviewDb,
} from "@/lib/roadmap-db";
import { jsonWithSource, resolveDataSource, withDatabase } from "@/lib/api-db";
import type { EntryStatus, TimeBlockId } from "@/lib/types";

const VALID_BLOCKS: TimeBlockId[] = ["learn", "rebuild", "build", "test"];
const VALID_STATUSES: EntryStatus[] = ["pending", "completed", "skipped", "missed"];

function lockedResponse(dayNumber: number, access: {
  allowed: boolean;
  message: string | null;
  requiredDay: number | null;
}) {
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
  if (!curriculum) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 });
  }

  const source = await resolveDataSource();

  if (source === "fallback") {
    const progress = getDayProgress(dayNumber);
    if (!progress) return NextResponse.json({ error: "Day not found" }, { status: 404 });
    const access = checkDayAccess(dayNumber);
    if (!access.allowed) return lockedResponse(dayNumber, access);
    return jsonWithSource(
      {
        day: curriculum,
        progress,
        unlocked: true,
        currentDay: getRoadmapOverview().currentDay,
        streaks: getRoadmapOverview().streaks,
      },
      "fallback",
    );
  }

  const accessResult = await withDatabase(() => checkDayAccessDb(dayNumber));
  if (!accessResult.ok) {
    return NextResponse.json({ error: accessResult.message }, { status: 503 });
  }
  if (!accessResult.value.allowed) {
    return lockedResponse(dayNumber, accessResult.value);
  }

  const result = await withDatabase(async () => {
    const progress = await getDayProgressDb(dayNumber);
    const overview = await getRoadmapOverviewDb();
    return {
      day: curriculum,
      progress,
      unlocked: true,
      currentDay: overview.currentDay,
      streaks: overview.streaks,
    };
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 503 });
  }
  return jsonWithSource(result.value, "database");
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ day: string }> },
) {
  const { day } = await params;
  const dayNumber = Number.parseInt(day, 10);
  const body = await req.json();
  const source = await resolveDataSource();

  if (source === "fallback") {
    const access = checkDayAccess(dayNumber);
    if (!access.allowed) return lockedResponse(dayNumber, access);

    if (body.blockId && body.status) {
      if (!VALID_BLOCKS.includes(body.blockId)) {
        return NextResponse.json({ error: "Invalid block" }, { status: 400 });
      }
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      const updated = updateBlockStatus(dayNumber, body.blockId, body.status);
      if (!updated) return NextResponse.json({ error: "Day not found" }, { status: 404 });
      return jsonWithSource(updated, "fallback");
    }

    const updated = updateDayNotes(dayNumber, {
      notes: body.notes,
      builtItems: body.builtItems,
      learnNotes: body.learnNotes,
      dayCompleted: body.dayCompleted,
    });
    if (!updated) return NextResponse.json({ error: "Day not found" }, { status: 404 });
    return jsonWithSource(updated, "fallback");
  }

  const accessResult = await withDatabase(() => checkDayAccessDb(dayNumber));
  if (!accessResult.ok) {
    return NextResponse.json({ error: accessResult.message }, { status: 503 });
  }
  if (!accessResult.value.allowed) {
    return lockedResponse(dayNumber, accessResult.value);
  }

  if (body.blockId && body.status) {
    if (!VALID_BLOCKS.includes(body.blockId)) {
      return NextResponse.json({ error: "Invalid block" }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const result = await withDatabase(() =>
      updateBlockStatusDb(dayNumber, body.blockId, body.status),
    );
    if (!result.ok) return NextResponse.json({ error: result.message }, { status: 503 });
    if (!result.value) return NextResponse.json({ error: "Day not found" }, { status: 404 });
    return jsonWithSource(result.value, "database");
  }

  const result = await withDatabase(() =>
    updateDayNotesDb(dayNumber, {
      notes: body.notes,
      builtItems: body.builtItems,
      learnNotes: body.learnNotes,
    }),
  );
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: 503 });
  if (!result.value) return NextResponse.json({ error: "Day not found" }, { status: 404 });
  return jsonWithSource(result.value, "database");
}
