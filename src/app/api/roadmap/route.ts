import { NextResponse } from "next/server";
import { getRoadmapOverview, startRoadmap } from "@/lib/roadmap-store";

export async function GET() {
  return NextResponse.json(getRoadmapOverview());
}

export async function POST() {
  return NextResponse.json(startRoadmap(), { status: 201 });
}
