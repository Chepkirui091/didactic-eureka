import type { Prisma } from "@prisma/client";
import { getPrisma } from "./prisma";
import { toEntry, toHabit } from "./mappers";
import type { EntryStatus, Habit, HabitEntry, ScheduleConfig } from "./types";
import { dateOffsetString, todayString } from "./streak";

export const DEMO_USER_ID = "demo-user-primary";
const DEMO_EMAIL = "demo@habitflow.app";

const SEED_HABITS = [
  {
    name: "Drink Water",
    description: "Stay hydrated throughout the day.",
    motivation: "Energy and focus.",
    category: "health",
    icon: "💧",
    sortOrder: 0,
    habitType: "binary",
    schedule: { frequency: "daily", timesPerDay: 1 },
    completionRate: 0.85,
  },
  {
    name: "Read",
    description: "Read books to learn and relax.",
    motivation: "30 pages a day adds up.",
    category: "learning",
    icon: "📖",
    sortOrder: 1,
    habitType: "quantitative",
    targetValue: 30,
    targetUnit: "pages",
    schedule: { frequency: "daily" },
    completionRate: 0.7,
  },
  {
    name: "Meditate",
    description: "Short daily meditation.",
    motivation: "Calm and clarity.",
    category: "mental",
    icon: "🧘",
    sortOrder: 2,
    habitType: "timed",
    targetDurationMinutes: 15,
    schedule: { frequency: "daily" },
    completionRate: 0.65,
  },
  {
    name: "Exercise",
    description: "Move your body.",
    motivation: "Strength and mood.",
    category: "health",
    icon: "🏃",
    sortOrder: 3,
    habitType: "binary",
    schedule: { frequency: "weekly", daysOfWeek: [1, 3, 5] },
    completionRate: 0.8,
    weeklyOnly: [1, 3, 5],
  },
  {
    name: "10,000 Steps",
    description: "Daily step goal.",
    motivation: "Cardio and activity.",
    category: "health",
    icon: "👟",
    sortOrder: 4,
    habitType: "quantitative",
    targetValue: 10000,
    targetUnit: "steps",
    schedule: { frequency: "daily" },
    completionRate: 0.5,
  },
] as Array<{
  name: string;
  description: string;
  motivation: string;
  category: string;
  icon: string;
  sortOrder: number;
  habitType: string;
  schedule: ScheduleConfig;
  completionRate: number;
  targetValue?: number;
  targetUnit?: string;
  targetDurationMinutes?: number;
  weeklyOnly?: number[];
}>;

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export async function ensureDemoUser() {
  return getPrisma().user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      name: "Demo User",
      preferences: {
        create: {
          theme: "system",
          accentColor: "emerald",
          weekStartsOn: 1,
          timezone: "UTC",
        },
      },
    },
  });
}

export async function ensureSeeded() {
  if (seeded) return;
  if (!seedPromise) {
    seedPromise = runSeed().then(() => {
      seeded = true;
    }).catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  await seedPromise;
}

let seeded = false;
let seedPromise: Promise<void> | null = null;

async function runSeed() {
  await ensureDemoUser();
  const count = await getPrisma().habit.count({ where: { userId: DEMO_USER_ID } });
  if (count > 0) return;

  for (const seed of SEED_HABITS) {
    const startDate = parseDate(dateOffsetString(-60));
    const habit = await getPrisma().habit.create({
      data: {
        userId: DEMO_USER_ID,
        name: seed.name,
        description: seed.description,
        motivation: seed.motivation,
        category: seed.category,
        icon: seed.icon,
        sortOrder: seed.sortOrder,
        habitType: seed.habitType,
        targetValue: "targetValue" in seed ? seed.targetValue : null,
        targetUnit: "targetUnit" in seed ? seed.targetUnit : null,
        targetDurationMinutes:
          "targetDurationMinutes" in seed ? seed.targetDurationMinutes : null,
        startDate,
        schedule: seed.schedule as unknown as Prisma.InputJsonValue,
      },
    });

    const entryRows: Prisma.HabitEntryCreateManyInput[] = [];
    for (let i = -60; i <= 0; i++) {
      const dateStr = dateOffsetString(i);
      const d = parseDate(dateStr);
      const day = d.getUTCDay();

      if (
        "weeklyOnly" in seed &&
        seed.weeklyOnly &&
        !(seed.weeklyOnly ?? []).includes(day)
      ) {
        continue;
      }

      const hash = (habit.id.charCodeAt(0) + i + day) % 10;
      const completed = hash / 10 < seed.completionRate;
      entryRows.push({
        habitId: habit.id,
        date: d,
        status: completed ? "completed" : i % 7 === 0 ? "skipped" : "missed",
        value:
          completed && seed.habitType === "quantitative"
            ? 20 + (hash % 15)
            : null,
        durationMinutes:
          completed && seed.habitType === "timed" ? 12 + (hash % 8) : null,
      });
    }

    if (entryRows.length > 0) {
      await getPrisma().habitEntry.createMany({ data: entryRows });
    }
  }
}

export async function listHabits(): Promise<Habit[]> {
  await ensureSeeded();
  const rows = await getPrisma().habit.findMany({
    where: { userId: DEMO_USER_ID },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(toHabit);
}

export async function getHabitById(id: string): Promise<Habit | null> {
  await ensureSeeded();
  const row = await getPrisma().habit.findFirst({
    where: { id, userId: DEMO_USER_ID },
  });
  return row ? toHabit(row) : null;
}

export async function createHabit(
  data: Omit<Habit, "id" | "userId" | "createdAt" | "updatedAt">,
): Promise<Habit> {
  await ensureDemoUser();
  const count = await getPrisma().habit.count({ where: { userId: DEMO_USER_ID } });
  const row = await getPrisma().habit.create({
    data: {
      userId: DEMO_USER_ID,
      name: data.name,
      description: data.description,
      motivation: data.motivation,
      category: data.category,
      icon: data.icon,
      sortOrder: data.sortOrder ?? count,
      habitType: data.habitType,
      targetValue: data.targetValue,
      targetUnit: data.targetUnit,
      targetDurationMinutes: data.targetDurationMinutes,
      startDate: parseDate(data.startDate),
      endDate: data.endDate ? parseDate(data.endDate) : null,
      schedule: data.schedule as unknown as Prisma.InputJsonValue,
    },
  });
  return toHabit(row);
}

export async function updateHabitById(
  id: string,
  data: Partial<Omit<Habit, "id" | "userId" | "createdAt">>,
): Promise<Habit | null> {
  const existing = await getPrisma().habit.findFirst({
    where: { id, userId: DEMO_USER_ID },
  });
  if (!existing) return null;

  const row = await getPrisma().habit.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      motivation: data.motivation,
      category: data.category,
      icon: data.icon,
      sortOrder: data.sortOrder,
      habitType: data.habitType,
      targetValue: data.targetValue,
      targetUnit: data.targetUnit,
      targetDurationMinutes: data.targetDurationMinutes,
      startDate: data.startDate ? parseDate(data.startDate) : undefined,
      endDate:
        data.endDate === undefined
          ? undefined
          : data.endDate
            ? parseDate(data.endDate)
            : null,
      schedule: data.schedule as unknown as Prisma.InputJsonValue | undefined,
    },
  });
  return toHabit(row);
}

export async function deleteHabitById(id: string): Promise<boolean> {
  const existing = await getPrisma().habit.findFirst({
    where: { id, userId: DEMO_USER_ID },
  });
  if (!existing) return false;
  await getPrisma().habit.delete({ where: { id } });
  return true;
}

export async function upsertEntry(
  habitId: string,
  date: string,
  status: EntryStatus,
): Promise<HabitEntry | null> {
  const habit = await getPrisma().habit.findFirst({
    where: { id: habitId, userId: DEMO_USER_ID },
  });
  if (!habit) return null;

  const row = await getPrisma().habitEntry.upsert({
    where: {
      habitId_date: { habitId, date: parseDate(date) },
    },
    create: {
      habitId,
      date: parseDate(date),
      status,
    },
    update: { status },
  });
  return toEntry(row);
}

export async function getEntriesForHabitId(habitId: string): Promise<HabitEntry[]> {
  await ensureSeeded();
  const rows = await getPrisma().habitEntry.findMany({
    where: { habitId },
    orderBy: { date: "desc" },
  });
  return rows.map(toEntry);
}

export async function getEntriesForDateStr(date: string): Promise<HabitEntry[]> {
  await ensureSeeded();
  const rows = await getPrisma().habitEntry.findMany({
    where: {
      date: parseDate(date),
      habit: { userId: DEMO_USER_ID },
    },
  });
  return rows.map(toEntry);
}

export async function getAllEntriesSince(daysBack: number): Promise<HabitEntry[]> {
  await ensureSeeded();
  const since = parseDate(dateOffsetString(-daysBack));
  const rows = await getPrisma().habitEntry.findMany({
    where: {
      date: { gte: since },
      habit: { userId: DEMO_USER_ID },
    },
    orderBy: { date: "asc" },
  });
  return rows.map(toEntry);
}

export async function getActivityCountByDate(
  daysBack: number,
): Promise<Record<string, number>> {
  const entries = await getAllEntriesSince(daysBack);
  const out: Record<string, number> = {};
  for (let i = 0; i <= daysBack; i++) {
    out[dateOffsetString(-i)] = 0;
  }
  for (const e of entries) {
    if (e.status === "completed" && e.date in out) {
      out[e.date] = (out[e.date] ?? 0) + 1;
    }
  }
  return out;
}

export { todayString };
