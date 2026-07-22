import type { RoadmapDay, TimeBlockConfig, RoadmapDayProgress } from "./types";
import {
  DEFAULT_TIME_BLOCKS,
  createEmptyDayProgress as createEmptyDayProgressCore,
  formatTimeRange as formatTimeRangeCore,
  isDayUnlocked as isDayUnlockedCore,
  getDayLockMessage as getDayLockMessageCore,
  getFirstIncompleteDay as getFirstIncompleteDayCore,
  computeRoadmapStats as computeRoadmapStatsCore,
  computeDayCompletionStreak as computeDayCompletionStreakCore,
  computeStudyStreak as computeStudyStreakCore,
  computeRoadmapStreaks as computeRoadmapStreaksCore,
  getRoadmapActivityByDate as getRoadmapActivityByDateCore,
  type RoadmapDefinition,
} from "./roadmap-core";

export const ROADMAP_ID = "nestjs-30-day";
export const ROADMAP_TITLE = "30-Day NestJS Roadmap";
export const ROADMAP_DESCRIPTION =
  "Build a full marketplace backend with NestJS, Prisma, PostgreSQL, auth, bookings, and real-world features.";

export const TIME_BLOCKS: TimeBlockConfig[] = DEFAULT_TIME_BLOCKS.map((b) =>
  b.id === "learn"
    ? { ...b, description: "Watch or read NestJS concepts (1–2 hours)" }
    : b.id === "test"
      ? { ...b, description: "Break your API intentionally and fix it" }
      : b,
);

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

export const NESTJS_ROADMAP: RoadmapDefinition = {
  id: ROADMAP_ID,
  title: ROADMAP_TITLE,
  description: ROADMAP_DESCRIPTION,
  tags: ["NestJS", "Marketplace", "30 days"],
  accent: "160 84% 39%",
  timeBlocks: TIME_BLOCKS,
  weekGoals: WEEK_GOALS,
  days: ROADMAP_DAYS,
};

export function createEmptyDayProgress(dayNumber: number): RoadmapDayProgress {
  return createEmptyDayProgressCore(dayNumber, TIME_BLOCKS);
}

export function formatTimeRange(start: string, end: string): string {
  return formatTimeRangeCore(start, end);
}

export function getDayByNumber(dayNumber: number): RoadmapDay | undefined {
  return ROADMAP_DAYS.find((d) => d.dayNumber === dayNumber);
}

/** Day N unlocks only after days 1..N-1 are fully completed. */
export function isDayUnlocked(
  dayNumber: number,
  progress: RoadmapDayProgress[],
): boolean {
  return isDayUnlockedCore(dayNumber, progress, ROADMAP_DAYS.length);
}

export function getDayLockMessage(
  dayNumber: number,
  progress: RoadmapDayProgress[],
): string | null {
  return getDayLockMessageCore(dayNumber, progress, ROADMAP_DAYS.length);
}

export function getFirstIncompleteDay(progress: RoadmapDayProgress[]): number {
  return getFirstIncompleteDayCore(progress, ROADMAP_DAYS.length);
}

export function computeRoadmapStats(progress: RoadmapDayProgress[]) {
  return computeRoadmapStatsCore(ROADMAP_DAYS, progress, TIME_BLOCKS);
}

export function computeDayCompletionStreak(progress: RoadmapDayProgress[]) {
  return computeDayCompletionStreakCore(progress, ROADMAP_DAYS.length);
}

export function computeStudyStreak(activityByDate: Record<string, number>) {
  return computeStudyStreakCore(activityByDate);
}

export function getRoadmapActivityByDate(
  activityByDate: Record<string, number>,
  daysBack: number,
) {
  return getRoadmapActivityByDateCore(activityByDate, daysBack);
}

export function computeRoadmapStreaks(
  progress: RoadmapDayProgress[],
  activityByDate: Record<string, number>,
) {
  return computeRoadmapStreaksCore(progress, activityByDate, ROADMAP_DAYS.length);
}
