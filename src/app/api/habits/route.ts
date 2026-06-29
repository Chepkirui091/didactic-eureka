import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/prisma";
import { listHabits, createHabit } from "@/lib/habits-db";
import { habitsStore } from "@/lib/api-store";
import type { Habit, ScheduleConfig } from "@/lib/types";

export async function GET() {
  if (!isDatabaseConfigured()) {
    const list = habitsStore.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    return NextResponse.json(list);
  }
  try {
    const list = await listHabits();
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
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

  if (!isDatabaseConfigured()) {
    const newHabit: Habit = {
      id: `api-${Date.now()}`,
      userId: "user-demo",
      ...habitData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    habitsStore.push(newHabit);
    return NextResponse.json(newHabit, { status: 201 });
  }

  try {
    const habits = await listHabits();
    const created = await createHabit({
      ...habitData,
      sortOrder: habits.length,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
