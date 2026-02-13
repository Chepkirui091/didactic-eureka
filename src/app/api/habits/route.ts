import { NextResponse } from "next/server";
import { habitsStore } from "@/lib/api-store";
import type { Habit, ScheduleConfig } from "@/lib/types";

export async function GET() {
  const list = habitsStore.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = body?.name?.trim();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const newHabit: Habit = {
    id: `api-${Date.now()}`,
    userId: "user-demo",
    name,
    description: body.description ?? null,
    motivation: body.motivation ?? null,
    category: (body.category as Habit["category"]) ?? "general",
    icon: body.icon ?? null,
    sortOrder: habitsStore.length,
    habitType: (body.habitType as Habit["habitType"]) ?? "binary",
    targetValue: body.targetValue ?? null,
    targetUnit: body.targetUnit ?? null,
    targetDurationMinutes: body.targetDurationMinutes ?? null,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: body.endDate ?? null,
    schedule: (body.schedule as ScheduleConfig) ?? { frequency: "daily" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  habitsStore.push(newHabit);
  return NextResponse.json(newHabit, { status: 201 });
}
