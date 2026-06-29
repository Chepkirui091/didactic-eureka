import type { Habit as PrismaHabit, HabitEntry as PrismaHabitEntry } from "@prisma/client";
import type { Habit, HabitEntry, ScheduleConfig } from "./types";

export function toHabit(row: PrismaHabit): Habit {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description,
    motivation: row.motivation,
    category: row.category as Habit["category"],
    icon: row.icon,
    sortOrder: row.sortOrder,
    habitType: row.habitType as Habit["habitType"],
    targetValue: row.targetValue,
    targetUnit: row.targetUnit,
    targetDurationMinutes: row.targetDurationMinutes,
    startDate: row.startDate.toISOString().slice(0, 10),
    endDate: row.endDate ? row.endDate.toISOString().slice(0, 10) : null,
    schedule: row.schedule as unknown as ScheduleConfig,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toEntry(row: PrismaHabitEntry): HabitEntry {
  return {
    id: row.id,
    habitId: row.habitId,
    date: row.date.toISOString().slice(0, 10),
    status: row.status as HabitEntry["status"],
    value: row.value,
    durationMinutes: row.durationMinutes,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
