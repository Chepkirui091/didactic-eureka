import { NextResponse } from "next/server";
import { jsonWithSource, resolveDataSource, withDatabase } from "@/lib/api-db";
import { listRoadmapSummaries } from "@/lib/roadmap-store";
import { listRoadmapSummariesDb } from "@/lib/roadmap-db";

/** GET /api/roadmap — list all learning projects */
export async function GET() {
  const source = await resolveDataSource();
  if (source === "fallback") {
    return jsonWithSource(listRoadmapSummaries(), "fallback");
  }

  const result = await withDatabase(() => listRoadmapSummariesDb());
  if (!result.ok) {
    return jsonWithSource(listRoadmapSummaries(), "fallback");
  }
  return jsonWithSource(result.value, "database");
}
