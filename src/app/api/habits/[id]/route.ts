import { NextResponse } from "next/server";
import { jsonWithSource, resolveDataSource, withDatabase } from "@/lib/api-db";
import {
  getHabitById,
  updateHabitById,
  deleteHabitById,
} from "@/lib/habits-db";
import { habitsStore, updateHabit } from "@/lib/api-store";
import type { HabitCategory, HabitType, ScheduleConfig } from "@/lib/types";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const source = await resolveDataSource();

  if (source === "fallback") {
    const habit = habitsStore.find((h) => h.id === id);
    if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return jsonWithSource(habit, "fallback");
  }

  const result = await withDatabase(() => getHabitById(id));
  if (!result.ok) {
    const habit = habitsStore.find((h) => h.id === id);
    if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return jsonWithSource(habit, "fallback");
  }
  if (!result.value) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return jsonWithSource(result.value, "database");
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const source = await resolveDataSource();

  if (source === "fallback") {
    const patch: Parameters<typeof updateHabit>[1] = {};
    if (body.name !== undefined) patch.name = body.name;
    if (body.description !== undefined) patch.description = body.description;
    if (body.motivation !== undefined) patch.motivation = body.motivation;
    if (body.category !== undefined) patch.category = body.category as HabitCategory;
    if (body.icon !== undefined) patch.icon = body.icon;
    if (body.sortOrder !== undefined) patch.sortOrder = body.sortOrder;
    if (body.habitType !== undefined) patch.habitType = body.habitType as HabitType;
    if (body.targetValue !== undefined) patch.targetValue = body.targetValue;
    if (body.targetUnit !== undefined) patch.targetUnit = body.targetUnit;
    if (body.targetDurationMinutes !== undefined)
      patch.targetDurationMinutes = body.targetDurationMinutes;
    if (body.startDate !== undefined) patch.startDate = body.startDate;
    if (body.endDate !== undefined) patch.endDate = body.endDate;
    if (body.schedule !== undefined) patch.schedule = body.schedule as ScheduleConfig;
    const updated = updateHabit(id, patch);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return jsonWithSource(updated, "fallback");
  }

  const result = await withDatabase(() =>
    updateHabitById(id, {
      name: body.name,
      description: body.description,
      motivation: body.motivation,
      category: body.category,
      icon: body.icon,
      sortOrder: body.sortOrder,
      habitType: body.habitType,
      targetValue: body.targetValue,
      targetUnit: body.targetUnit,
      targetDurationMinutes: body.targetDurationMinutes,
      startDate: body.startDate,
      endDate: body.endDate,
      schedule: body.schedule,
    }),
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 503 });
  }
  if (!result.value) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return jsonWithSource(result.value, "database");
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const source = await resolveDataSource();

  if (source === "fallback") {
    const idx = habitsStore.findIndex((h) => h.id === id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    habitsStore.splice(idx, 1);
    return new NextResponse(null, { status: 204 });
  }

  const result = await withDatabase(() => deleteHabitById(id));
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 503 });
  }
  if (!result.value) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
