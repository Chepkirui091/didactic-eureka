import { NextResponse } from "next/server";
import { jsonWithSource, resolveDataSource, withDatabase } from "@/lib/api-db";
import { getRoadmapOverview, startRoadmap } from "@/lib/roadmap-store";
import { getRoadmapOverviewDb, startRoadmapDb } from "@/lib/roadmap-db";
import { getRoadmapDefinition } from "@/lib/roadmap-registry";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ roadmapId: string }> },
) {
  const { roadmapId } = await params;
  if (!getRoadmapDefinition(roadmapId)) {
    return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
  }

  const source = await resolveDataSource();
  if (source === "fallback") {
    return jsonWithSource(getRoadmapOverview(roadmapId), "fallback");
  }

  const result = await withDatabase(() => getRoadmapOverviewDb(roadmapId));
  if (!result.ok) {
    return jsonWithSource(getRoadmapOverview(roadmapId), "fallback");
  }
  return jsonWithSource(result.value, "database");
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ roadmapId: string }> },
) {
  const { roadmapId } = await params;
  if (!getRoadmapDefinition(roadmapId)) {
    return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
  }

  const source = await resolveDataSource();
  if (source === "fallback") {
    return jsonWithSource(startRoadmap(roadmapId), "fallback", { status: 201 });
  }

  const result = await withDatabase(() => startRoadmapDb(roadmapId));
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 503 });
  }
  return jsonWithSource(result.value, "database", { status: 201 });
}
