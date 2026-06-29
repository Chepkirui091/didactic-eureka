import { NextResponse } from "next/server";
import { jsonWithSource, resolveDataSource, withDatabase } from "@/lib/api-db";
import { listHabits, createHabit } from "@/lib/habits-db";
import { habitsStore } from "@/lib/api-store";
import type { Habit, ScheduleConfig } from "@/lib/types";

export async function GET() {
  const source = await resolveDataSource();
  if (source === "fallback") {
    const list = habitsStore.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    return jsonWithSource(list, "fallback");
  }

  const result = await withDatabase(() => listHabits());
  if (!result.ok) {
    const list = habitsStore.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    return jsonWithSource(list, "fallback");
  }
  return jsonWithSource(result.value, "database");
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = body?.name?.trim();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const habitData = {
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
  };

  const source = await resolveDataSource();
  if (source === "fallback") {
    const newHabit: Habit = {
      id: `api-${Date.now()}`,
      userId: "user-demo",
      ...habitData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    habitsStore.push(newHabit);
    return jsonWithSource(newHabit, "fallback", { status: 201 });
  }

  const result = await withDatabase(async () => {
    const habits = await listHabits();
    return createHabit({ ...habitData, sortOrder: habits.length });
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 503 });
  }
  return jsonWithSource(result.value, "database", { status: 201 });
}
