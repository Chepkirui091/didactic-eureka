import { NextResponse } from "next/server";
import {
  getDayProgress,
  updateBlockStatus,
  updateTaskStatus,
  updateDayNotes,
  checkDayAccess,
  getRoadmapOverview,
} from "@/lib/roadmap-store";
import {
  getDayProgressDb,
  updateBlockStatusDb,
  updateTaskStatusDb,
  updateDayNotesDb,
  checkDayAccessDb,
  getRoadmapOverviewDb,
} from "@/lib/roadmap-db";
import { jsonWithSource, resolveDataSource, withDatabase } from "@/lib/api-db";
import { getRoadmapDefinition } from "@/lib/roadmap-registry";
import type { EntryStatus, TimeBlockId } from "@/lib/types";

const VALID_BLOCKS: TimeBlockId[] = ["learn", "rebuild", "build", "test"];
const VALID_STATUSES: EntryStatus[] = ["pending", "completed", "skipped", "missed"];

function lockedResponse(access: {
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
  { params }: { params: Promise<{ roadmapId: string; day: string }> },
) {
  const { roadmapId, day } = await params;
  const def = getRoadmapDefinition(roadmapId);
  const dayNumber = Number.parseInt(day, 10);
  const curriculum = def?.days.find((d) => d.dayNumber === dayNumber);
  if (!def || !curriculum) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 });
  }

  const source = await resolveDataSource();

  if (source === "fallback") {
    const progress = getDayProgress(roadmapId, dayNumber);
    if (!progress) return NextResponse.json({ error: "Day not found" }, { status: 404 });
    const access = checkDayAccess(roadmapId, dayNumber);
    if (!access.allowed) return lockedResponse(access);
    const overview = getRoadmapOverview(roadmapId);
    return jsonWithSource(
      {
        day: curriculum,
        progress,
        unlocked: true,
        currentDay: overview.currentDay,
        streaks: overview.streaks,
      },
      "fallback",
    );
  }

  const accessResult = await withDatabase(async () => {
    const access = await checkDayAccessDb(roadmapId, dayNumber);
    if (!access.allowed) return { locked: true as const, access };
    const progress = await getDayProgressDb(roadmapId, dayNumber);
    const overview = await getRoadmapOverviewDb(roadmapId);
    return {
      locked: false as const,
      day: curriculum,
      progress,
      unlocked: true,
      currentDay: overview.currentDay,
      streaks: overview.streaks,
    };
  });

  if (!accessResult.ok) {
    return NextResponse.json({ error: accessResult.message }, { status: 503 });
  }
  if (accessResult.value.locked) {
    return lockedResponse(accessResult.value.access);
  }
  return jsonWithSource(accessResult.value, "database");
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ roadmapId: string; day: string }> },
) {
  const { roadmapId, day } = await params;
  const def = getRoadmapDefinition(roadmapId);
  const dayNumber = Number.parseInt(day, 10);
  if (!def || Number.isNaN(dayNumber) || dayNumber < 1 || dayNumber > def.days.length) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 });
  }

  const body = await req.json();
  const source = await resolveDataSource();

  if (source === "fallback") {
    const access = checkDayAccess(roadmapId, dayNumber);
    if (!access.allowed) return lockedResponse(access);

    if (body.taskId && body.status) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      const updated = updateTaskStatus(roadmapId, dayNumber, body.taskId, body.status);
      if (!updated) return NextResponse.json({ error: "Day not found" }, { status: 404 });
      return jsonWithSource(updated, "fallback");
    }

    if (body.blockId && body.status) {
      if (!VALID_BLOCKS.includes(body.blockId)) {
        return NextResponse.json({ error: "Invalid block" }, { status: 400 });
      }
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      const updated = updateBlockStatus(roadmapId, dayNumber, body.blockId, body.status);
      if (!updated) return NextResponse.json({ error: "Day not found" }, { status: 404 });
      return jsonWithSource(updated, "fallback");
    }

    const updated = updateDayNotes(roadmapId, dayNumber, {
      notes: body.notes,
      builtItems: body.builtItems,
      learnNotes: body.learnNotes,
    });
    if (!updated) return NextResponse.json({ error: "Day not found" }, { status: 404 });
    return jsonWithSource(updated, "fallback");
  }

  const accessResult = await withDatabase(async () => {
    const access = await checkDayAccessDb(roadmapId, dayNumber);
    if (!access.allowed) return { locked: true as const, access };

    if (body.taskId && body.status) {
      if (!VALID_STATUSES.includes(body.status)) {
        return { error: "Invalid status" as const };
      }
      const updated = await updateTaskStatusDb(
        roadmapId,
        dayNumber,
        body.taskId,
        body.status,
      );
      return { locked: false as const, updated };
    }

    if (body.blockId && body.status) {
      if (!VALID_BLOCKS.includes(body.blockId)) {
        return { error: "Invalid block" as const };
      }
      if (!VALID_STATUSES.includes(body.status)) {
        return { error: "Invalid status" as const };
      }
      const updated = await updateBlockStatusDb(
        roadmapId,
        dayNumber,
        body.blockId,
        body.status,
      );
      return { locked: false as const, updated };
    }

    const updated = await updateDayNotesDb(roadmapId, dayNumber, {
      notes: body.notes,
      builtItems: body.builtItems,
      learnNotes: body.learnNotes,
    });
    return { locked: false as const, updated };
  });

  if (!accessResult.ok) {
    return NextResponse.json({ error: accessResult.message }, { status: 503 });
  }
  const value = accessResult.value;
  if ("error" in value && value.error) {
    return NextResponse.json({ error: value.error }, { status: 400 });
  }
  if (value.locked) {
    return lockedResponse(value.access);
  }
  if (!value.updated) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 });
  }
  return jsonWithSource(value.updated, "database");
}
