import type { RoadmapDay, TimeBlockConfig, RoadmapDayProgress, TimeBlockId, StreakInfo } from "./types";

export const ROADMAP_ID = "nestjs-30-day";
export const ROADMAP_TITLE = "30-Day NestJS Roadmap";
export const ROADMAP_DESCRIPTION =
  "Build a full marketplace backend with NestJS, Prisma, PostgreSQL, auth, bookings, and real-world features.";

export const TIME_BLOCKS: TimeBlockConfig[] = [
  {
    id: "learn",
    label: "Learn",
    startTime: "05:30",
    endTime: "07:30",
    description: "Watch or read NestJS concepts (1–2 hours)",
  },
  {
    id: "rebuild",
    label: "Rebuild",
    startTime: "09:30",
    endTime: "10:00",
    description: "Rebuild yesterday's feature from memory",
  },
  {
    id: "build",
    label: "Build",
    startTime: "19:30",
    endTime: "21:30",
    description: "Implement today's feature immediately (2 hours)",
  },
  {
    id: "test",
    label: "Test",
    startTime: "21:30",
    endTime: "22:00",
    description: "Break your API intentionally and fix it",
  },
];

export const WEEK_GOALS: Record<number, string> = {
  1: "Understand NestJS structure and build simple CRUD APIs.",
  2: "Connect PostgreSQL + Prisma, build auth with JWT and role-based access.",
  3: "Build core marketplace logic: shops, services, and bookings.",
  4: "Add real-world features, connect to Next.js, deploy MVP.",
};

export const ROADMAP_DAYS: RoadmapDay[] = [
  {
    dayNumber: 1,
    week: 1,
    weekLabel: "Week 1 — Core NestJS + API Fundamentals",
    title: "Setup + Mental Model",
    topics: [
      "Install NestJS CLI",
      "Create project",
      "Understand folder structure: modules, controllers, services",
      "What is dependency injection (DI)",
    ],
    task: "Create users module manually",
  },
  {
    dayNumber: 2,
    week: 1,
    weekLabel: "Week 1 — Core NestJS + API Fundamentals",
    title: "Controllers & Routes",
    topics: [
      "GET, POST, PUT, DELETE",
      "Route params & query params",
    ],
    task: "Build UsersController with hardcoded data (no DB yet)",
  },
  {
    dayNumber: 3,
    week: 1,
    weekLabel: "Week 1 — Core NestJS + API Fundamentals",
    title: "Services (Business Logic Layer)",
    topics: [
      "Why services exist",
      "Separation of concerns",
    ],
    task: "Move logic from controller → service",
  },
  {
    dayNumber: 4,
    week: 1,
    weekLabel: "Week 1 — Core NestJS + API Fundamentals",
    title: "Modules System",
    topics: [
      "How Nest organizes apps",
      "Feature-based architecture",
    ],
    task: "Create Users module and Shops module (empty for now)",
  },
  {
    dayNumber: 5,
    week: 1,
    weekLabel: "Week 1 — Core NestJS + API Fundamentals",
    title: "DTOs + Validation",
    topics: [
      "class-validator",
      "DTO structure",
    ],
    task: "Add validation to create user",
  },
  {
    dayNumber: 6,
    week: 1,
    weekLabel: "Week 1 — Core NestJS + API Fundamentals",
    title: "Mini Project",
    isMiniProject: true,
    topics: ["Users CRUD fully working (in-memory)"],
    task: "Build Users CRUD fully working (in-memory)",
  },
  {
    dayNumber: 7,
    week: 1,
    weekLabel: "Week 1 — Core NestJS + API Fundamentals",
    title: "Review Day",
    isReviewDay: true,
    topics: [
      "Rebuild Users module without looking",
      "Fix weak areas",
    ],
    task: "Rebuild Users module from memory and fix weak areas",
  },
  {
    dayNumber: 8,
    week: 2,
    weekLabel: "Week 2 — Database + Authentication",
    title: "PostgreSQL + Prisma Setup",
    goal: "Database + Authentication (VERY IMPORTANT)",
    topics: [
      "Install PostgreSQL",
      "Setup Prisma",
      "Create schema",
    ],
    task: "User model in DB",
  },
  {
    dayNumber: 9,
    week: 2,
    weekLabel: "Week 2 — Database + Authentication",
    title: "Prisma CRUD",
    topics: ["Replace in-memory storage with database"],
    task: "Replace in-memory users with DB users",
  },
  {
    dayNumber: 10,
    week: 2,
    weekLabel: "Week 2 — Database + Authentication",
    title: "Authentication (JWT)",
    topics: [
      "Hash passwords (bcrypt)",
      "Login + register",
    ],
    task: "Auth module (basic)",
  },
  {
    dayNumber: 11,
    week: 2,
    weekLabel: "Week 2 — Database + Authentication",
    title: "Guards",
    topics: [
      "Protect routes",
      "JWT guard",
    ],
    task: "/me endpoint (protected)",
  },
  {
    dayNumber: 12,
    week: 2,
    weekLabel: "Week 2 — Database + Authentication",
    title: "Roles System",
    topics: [
      "customer",
      "barber",
      "shop_owner",
      "admin",
    ],
    task: "Role-based guard",
  },
  {
    dayNumber: 13,
    week: 2,
    weekLabel: "Week 2 — Database + Authentication",
    title: "Error Handling + Structure Cleanup",
    topics: [
      "Pipes",
      "Exception filters",
    ],
    task: "Clean up project structure with proper error handling",
  },
  {
    dayNumber: 14,
    week: 2,
    weekLabel: "Week 2 — Database + Authentication",
    title: "Mini Project",
    isMiniProject: true,
    topics: [
      "Auth system fully working",
      "Role-based access working",
    ],
    task: "Build auth system fully working with role-based access",
  },
  {
    dayNumber: 15,
    week: 3,
    weekLabel: "Week 3 — Core Marketplace Logic",
    title: "Shops Module",
    topics: [
      "Create shop entity",
      "Link shop to owner",
    ],
    task: "Create shops module with owner relationship",
  },
  {
    dayNumber: 16,
    week: 3,
    weekLabel: "Week 3 — Core Marketplace Logic",
    title: "Services Module",
    topics: ["Add services (haircut, braids, nails)"],
    task: "Create services linked to shops",
  },
  {
    dayNumber: 17,
    week: 3,
    weekLabel: "Week 3 — Core Marketplace Logic",
    title: "Booking Model Design",
    topics: [
      "Time slots",
      "Availability logic",
    ],
    task: "Create booking schema",
  },
  {
    dayNumber: 18,
    week: 3,
    weekLabel: "Week 3 — Core Marketplace Logic",
    title: "Booking API (Create Booking)",
    topics: [
      "Check availability",
      "Prevent double booking",
    ],
    task: "Build create booking endpoint with availability checks",
  },
  {
    dayNumber: 19,
    week: 3,
    weekLabel: "Week 3 — Core Marketplace Logic",
    title: "Booking Logic (Advanced)",
    topics: [
      "Cancel booking",
      "Reschedule",
    ],
    task: "Implement cancel and reschedule booking",
  },
  {
    dayNumber: 20,
    week: 3,
    weekLabel: "Week 3 — Core Marketplace Logic",
    title: "Availability System",
    topics: [
      "Working hours",
      "Blocked slots",
    ],
    task: "Build availability system with working hours and blocked slots",
  },
  {
    dayNumber: 21,
    week: 3,
    weekLabel: "Week 3 — Core Marketplace Logic",
    title: "Weekly Review Project",
    isMiniProject: true,
    topics: ["Shop → Services → Bookings flow end-to-end"],
    task: "Build Shop → Services → Bookings flow working end-to-end",
  },
  {
    dayNumber: 22,
    week: 4,
    weekLabel: "Week 4 — Real-World Features",
    title: "Notifications System",
    topics: [
      "Email or console notifications",
      "Booking confirmation",
    ],
    task: "Send booking confirmation notifications",
  },
  {
    dayNumber: 23,
    week: 4,
    weekLabel: "Week 4 — Real-World Features",
    title: "WebSockets (Real-time Updates)",
    topics: [
      "Nest Gateway",
      "Live booking updates",
    ],
    task: "Implement WebSocket gateway for live booking updates",
  },
  {
    dayNumber: 24,
    week: 4,
    weekLabel: "Week 4 — Real-World Features",
    title: "File Uploads",
    topics: [
      "Shop images",
      "Profiles",
      "Cloudinary or S3",
    ],
    task: "Add file upload for shop images and profiles",
  },
  {
    dayNumber: 25,
    week: 4,
    weekLabel: "Week 4 — Real-World Features",
    title: "Admin Panel APIs",
    topics: [
      "Manage users",
      "Manage shops",
      "Manage bookings",
    ],
    task: "Build admin APIs for users, shops, and bookings",
  },
  {
    dayNumber: 26,
    week: 4,
    weekLabel: "Week 4 — Real-World Features",
    title: "Payments (Basic Integration)",
    topics: ["Stripe OR mobile money simulation"],
    task: "Integrate basic payment flow (Stripe or simulation)",
  },
  {
    dayNumber: 27,
    week: 4,
    weekLabel: "Week 4 — Real-World Features",
    title: "API Cleanup + Architecture",
    topics: [
      "Refactor modules",
      "Clean structure",
    ],
    task: "Refactor and clean up API architecture",
  },
  {
    dayNumber: 28,
    week: 4,
    weekLabel: "Week 4 — Real-World Features",
    title: "Connect to Next.js Frontend",
    topics: [
      "Login flow",
      "Booking flow",
      "API integration",
    ],
    task: "Connect this habits/frontend app to your NestJS API",
  },
  {
    dayNumber: 29,
    week: 4,
    weekLabel: "Week 4 — Real-World Features",
    title: "Build MVP Flow End-to-End",
    isMiniProject: true,
    topics: [
      "User signs up",
      "Logs in",
      "Views shops",
      "Books service",
      "Shop sees booking",
    ],
    task: "Fully working MVP: signup → login → view shops → book → shop sees booking",
  },
  {
    dayNumber: 30,
    week: 4,
    weekLabel: "Week 4 — Real-World Features",
    title: "Polish + Deployment",
    topics: [
      "Deploy backend (Render / Railway / AWS)",
      "Environment variables",
      "Basic logging",
    ],
    task: "Deploy backend and configure production environment",
  },
];

export function createEmptyDayProgress(dayNumber: number): RoadmapDayProgress {
  const blocks = {} as Record<TimeBlockId, "pending">;
  for (const block of TIME_BLOCKS) {
    blocks[block.id] = "pending";
  }
  return {
    dayNumber,
    blocks,
    notes: "",
    builtItems: "",
    learnNotes: "",
    dayCompleted: false,
    completedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

export function formatTimeRange(start: string, end: string): string {
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

export function getDayByNumber(dayNumber: number): RoadmapDay | undefined {
  return ROADMAP_DAYS.find((d) => d.dayNumber === dayNumber);
}

/** Day N unlocks only after days 1..N-1 are fully completed (all 4 blocks). */
export function isDayUnlocked(
  dayNumber: number,
  progress: RoadmapDayProgress[],
): boolean {
  if (dayNumber < 1 || dayNumber > ROADMAP_DAYS.length) return false;
  if (dayNumber === 1) return true;
  for (let d = 1; d < dayNumber; d++) {
    const p = progress.find((x) => x.dayNumber === d);
    if (!p?.dayCompleted) return false;
  }
  return true;
}

export function getDayLockMessage(
  dayNumber: number,
  progress: RoadmapDayProgress[],
): string | null {
  if (isDayUnlocked(dayNumber, progress)) return null;
  for (let d = 1; d < dayNumber; d++) {
    const p = progress.find((x) => x.dayNumber === d);
    if (!p?.dayCompleted) {
      return `Complete Day ${d} first — mark all 4 blocks (Learn, Rebuild, Build, Test) as done.`;
    }
  }
  return "This day is locked.";
}

export function getFirstIncompleteDay(progress: RoadmapDayProgress[]): number {
  const first = progress.find((p) => !p.dayCompleted);
  return first?.dayNumber ?? ROADMAP_DAYS.length;
}

export function computeRoadmapStats(progress: RoadmapDayProgress[]) {
  const daysCompleted = progress.filter((p) => p.dayCompleted).length;
  let blocksCompleted = 0;
  const totalBlocks = ROADMAP_DAYS.length * TIME_BLOCKS.length;
  for (const p of progress) {
    for (const block of TIME_BLOCKS) {
      if (p.blocks[block.id] === "completed") blocksCompleted += 1;
    }
  }
  return {
    daysCompleted,
    blocksCompleted,
    totalBlocks,
    completionPercentage: totalBlocks
      ? Math.round((blocksCompleted / totalBlocks) * 100)
      : 0,
  };
}

function roadmapToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function roadmapDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Consecutive roadmap days fully completed from Day 1. */
export function computeDayCompletionStreak(progress: RoadmapDayProgress[]): StreakInfo {
  let current = 0;
  for (let d = 1; d <= ROADMAP_DAYS.length; d++) {
    const p = progress.find((x) => x.dayNumber === d);
    if (p?.dayCompleted) current++;
    else break;
  }
  let longest = 0;
  let run = 0;
  for (let d = 1; d <= ROADMAP_DAYS.length; d++) {
    const p = progress.find((x) => x.dayNumber === d);
    if (p?.dayCompleted) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  return { current, longest };
}

/** Consecutive calendar days with at least one block completed. */
export function computeStudyStreak(activityByDate: Record<string, number>): StreakInfo {
  const today = roadmapToday();
  const yesterday = roadmapDateOffset(-1);
  const dates = Object.entries(activityByDate)
    .filter(([, count]) => count > 0)
    .map(([date]) => date)
    .sort((a, b) => a.localeCompare(b));

  if (dates.length === 0) return { current: 0, longest: 0 };

  let longest = 0;
  let run = 0;
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = new Date(dates[i - 1]).getTime();
      const curr = new Date(dates[i]).getTime();
      const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
      run = diffDays === 1 ? run + 1 : 1;
    }
    longest = Math.max(longest, run);
  }

  const latest = dates[dates.length - 1];
  let current = 0;
  if (latest === today || latest === yesterday) {
    current = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
      const prev = new Date(dates[i]).getTime();
      const next = new Date(dates[i + 1]).getTime();
      const diffDays = (next - prev) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) current++;
      else break;
    }
  }

  return { current, longest };
}

export function getRoadmapActivityByDate(
  activityByDate: Record<string, number>,
  daysBack: number,
): Record<string, number> {
  const today = roadmapToday();
  const out: Record<string, number> = {};
  const end = new Date(today);
  for (let i = 0; i <= daysBack; i++) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    out[dateStr] = activityByDate[dateStr] ?? 0;
  }
  return out;
}

export function computeRoadmapStreaks(
  progress: RoadmapDayProgress[],
  activityByDate: Record<string, number>,
) {
  return {
    days: computeDayCompletionStreak(progress),
    study: computeStudyStreak(activityByDate),
  };
}
