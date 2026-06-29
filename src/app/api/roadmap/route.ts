import { NextResponse } from "next/server";
import { jsonWithSource, resolveDataSource, withDatabase } from "@/lib/api-db";
import { getRoadmapOverview, startRoadmap } from "@/lib/roadmap-store";
import { getRoadmapOverviewDb, startRoadmapDb } from "@/lib/roadmap-db";

export async function GET() {
  const source = await resolveDataSource();
  if (source === "fallback") {
    return jsonWithSource(getRoadmapOverview(), "fallback");
  }

  const result = await withDatabase(() => getRoadmapOverviewDb());
  if (!result.ok) {
    return jsonWithSource(getRoadmapOverview(), "fallback");
  }
  return jsonWithSource(result.value, "database");
}

export async function POST() {
  const source = await resolveDataSource();
  if (source === "fallback") {
    return jsonWithSource(startRoadmap(), "fallback", { status: 201 });
  }

  const result = await withDatabase(() => startRoadmapDb());
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 503 });
  }
  return jsonWithSource(result.value, "database", { status: 201 });
}
