import type { RoadmapDay } from "./types";
import { DEFAULT_TIME_BLOCKS, type RoadmapDefinition } from "./roadmap-core";

export const TICKET_ROADMAP_ID = "nestjs-ticket-7-day";

export const TICKET_WEEK_GOALS: Record<number, string> = {
  1: "Ship a production-ready NestJS ticket API with a matching frontend — auth, tickets, comments, analytics, and deploy.",
};

export const TICKET_ROADMAP_DAYS: RoadmapDay[] = [
  {
    dayNumber: 1,
    week: 1,
    weekLabel: "Week 1 — Ticket System",
    title: "Foundation & Authentication",
    goal: "A secure API that users can log into — plus matching auth UI.",
    topics: [
      "NestJS project + ConfigModule",
      "Prisma + PostgreSQL",
      "ValidationPipe, CORS, Helmet, Swagger",
      "JWT auth, bcrypt, roles",
    ],
    task: "Register, login, JWT guard, and a protected endpoint — with frontend auth screens.",
    checklist: [
      "Database connected",
      "Swagger working",
      "User registration",
      "Login",
      "JWT authentication",
      "Protected endpoint",
    ],
    projects: [
      {
        id: "d1-backend",
        title: "Backend API",
        track: "backend",
        description: "NestJS foundation + auth",
        tasks: [
          { id: "d1-be-init", label: "Initialize NestJS + ESLint/Prettier" },
          { id: "d1-be-config", label: "Configure ConfigModule + env validation" },
          { id: "d1-be-prisma", label: "Set up Prisma and connect PostgreSQL" },
          { id: "d1-be-migrate", label: "First migration: User, Role, Ticket, Comment, Notification" },
          { id: "d1-be-pipes", label: "Global ValidationPipe, /api/v1 prefix, Swagger, CORS, Helmet" },
          { id: "d1-be-register", label: "Register endpoint + bcrypt password hashing" },
          { id: "d1-be-login", label: "Login + JWT access token" },
          { id: "d1-be-guards", label: "JWT Guard, Roles Guard, @CurrentUser() decorator" },
          { id: "d1-be-protected", label: "Protected smoke-test endpoint" },
        ],
      },
      {
        id: "d1-frontend",
        title: "Frontend App",
        track: "frontend",
        description: "Auth screens + session",
        tasks: [
          { id: "d1-fe-scaffold", label: "Scaffold frontend app (Next.js or preferred stack)" },
          { id: "d1-fe-api-client", label: "API client pointed at /api/v1" },
          { id: "d1-fe-register", label: "Register page" },
          { id: "d1-fe-login", label: "Login page + store JWT securely" },
          { id: "d1-fe-guard", label: "Protected route / auth gate" },
          { id: "d1-fe-user", label: "Show current user after login" },
        ],
      },
    ],
  },
  {
    dayNumber: 2,
    week: 1,
    weekLabel: "Week 1 — Ticket System",
    title: "Users & Tickets",
    goal: "Customers can create and manage tickets.",
    topics: [
      "User profile CRUD",
      "Ticket CRUD with DTOs",
      "Owner-only edit/delete authorization",
    ],
    task: "Full user + ticket CRUD on API and UI.",
    checklist: [
      "CRUD users",
      "CRUD tickets",
      "Authorization working",
    ],
    projects: [
      {
        id: "d2-backend",
        title: "Backend API",
        track: "backend",
        description: "Users & tickets modules",
        tasks: [
          { id: "d2-be-profile", label: "GET / UPDATE profile" },
          { id: "d2-be-admin-users", label: "Admin: list all users" },
          { id: "d2-be-ticket-create", label: "Create ticket (DTO + validation)" },
          { id: "d2-be-ticket-list", label: "Get all tickets" },
          { id: "d2-be-ticket-one", label: "Get one ticket" },
          { id: "d2-be-ticket-update", label: "Update ticket (owner only)" },
          { id: "d2-be-ticket-delete", label: "Delete ticket (owner only)" },
        ],
      },
      {
        id: "d2-frontend",
        title: "Frontend App",
        track: "frontend",
        description: "Profile + ticket management UI",
        tasks: [
          { id: "d2-fe-profile", label: "Profile view / edit page" },
          { id: "d2-fe-ticket-list", label: "Ticket list page" },
          { id: "d2-fe-ticket-create", label: "Create ticket form" },
          { id: "d2-fe-ticket-detail", label: "Ticket detail page" },
          { id: "d2-fe-ticket-edit", label: "Edit / delete own tickets" },
        ],
      },
    ],
  },
  {
    dayNumber: 3,
    week: 1,
    weekLabel: "Week 1 — Ticket System",
    title: "Comments & Workflow",
    goal: "Tickets become conversations with status workflow.",
    topics: [
      "Comment CRUD",
      "Assign / status / resolve / escalate",
      "Agent vs admin permissions",
    ],
    task: "Threaded comments + ticket workflow actions.",
    checklist: [
      "Ticket conversations",
      "Status changes",
      "Assignment logic",
    ],
    projects: [
      {
        id: "d3-backend",
        title: "Backend API",
        track: "backend",
        description: "Comments + workflow",
        tasks: [
          { id: "d3-be-comment-add", label: "Add comment" },
          { id: "d3-be-comment-update", label: "Update comment" },
          { id: "d3-be-comment-delete", label: "Delete comment" },
          { id: "d3-be-comment-list", label: "Get comments for ticket" },
          { id: "d3-be-assign-self", label: "Agent: assign self" },
          { id: "d3-be-status", label: "Agent: change status / resolve / escalate" },
          { id: "d3-be-admin-assign", label: "Admin: assign agents" },
        ],
      },
      {
        id: "d3-frontend",
        title: "Frontend App",
        track: "frontend",
        description: "Conversation UI + workflow controls",
        tasks: [
          { id: "d3-fe-comments", label: "Comment thread on ticket detail" },
          { id: "d3-fe-comment-actions", label: "Edit / delete own comments" },
          { id: "d3-fe-workflow", label: "Status / assign / resolve / escalate controls" },
          { id: "d3-fe-agent-view", label: "Agent queue / assigned tickets view" },
        ],
      },
    ],
  },
  {
    dayNumber: 4,
    week: 1,
    weekLabel: "Week 1 — Ticket System",
    title: "Filtering & Analytics",
    goal: "Make the API practical with search, sort, pagination, and dashboards.",
    topics: [
      "Filter by status, priority, category",
      "Search title + customer name",
      "Sort + pagination",
      "Dashboard aggregates",
    ],
    task: "Queryable tickets + dashboard metrics.",
    checklist: [
      "Search",
      "Filter",
      "Pagination",
      "Dashboard endpoints",
    ],
    projects: [
      {
        id: "d4-backend",
        title: "Backend API",
        track: "backend",
        description: "Query layer + analytics",
        tasks: [
          { id: "d4-be-filter", label: "Filter: status, priority, category" },
          { id: "d4-be-search", label: "Search: title, customer name" },
          { id: "d4-be-sort", label: "Sort: created, updated, priority" },
          { id: "d4-be-page", label: "Pagination: GET /tickets?page=&limit=" },
          { id: "d4-be-dash", label: "Dashboard: totals, open/closed, by priority & category" },
        ],
      },
      {
        id: "d4-frontend",
        title: "Frontend App",
        track: "frontend",
        description: "Filters + dashboard UI",
        tasks: [
          { id: "d4-fe-filters", label: "Filter / search / sort controls on ticket list" },
          { id: "d4-fe-pagination", label: "Pagination UI" },
          { id: "d4-fe-dashboard", label: "Dashboard page with charts/stats" },
        ],
      },
    ],
  },
  {
    dayNumber: 5,
    week: 1,
    weekLabel: "Week 1 — Ticket System",
    title: "Notifications & Error Handling",
    goal: "Reliable UX with notifications, consistent errors, and Nest logging.",
    topics: [
      "Notification events",
      "Global exception filter shape",
      "Nest Logger",
    ],
    task: "Notifications + global error envelope + logging.",
    checklist: [
      "Notifications",
      "Global error handling",
      "Logging",
    ],
    projects: [
      {
        id: "d5-backend",
        title: "Backend API",
        track: "backend",
        description: "Notifications + resilience",
        tasks: [
          { id: "d5-be-notify-assign", label: "Notify on ticket assigned" },
          { id: "d5-be-notify-comment", label: "Notify on comment added" },
          { id: "d5-be-notify-close", label: "Notify on closed / reopened" },
          { id: "d5-be-filter", label: "Global exception filter (success/message/statusCode/timestamp/path)" },
          { id: "d5-be-logger", label: "Replace console.log with Nest Logger" },
        ],
      },
      {
        id: "d5-frontend",
        title: "Frontend App",
        track: "frontend",
        description: "Inbox + error UX",
        tasks: [
          { id: "d5-fe-inbox", label: "Notifications inbox / bell UI" },
          { id: "d5-fe-mark-read", label: "Mark notifications read" },
          { id: "d5-fe-errors", label: "Map API error envelope to toasts" },
        ],
      },
    ],
  },
  {
    dayNumber: 6,
    week: 1,
    weekLabel: "Week 1 — Ticket System",
    title: "Testing & Cleanup",
    goal: "Solid services, unit tests, and complete Swagger.",
    topics: [
      "Refactor large services",
      "Unit tests for Auth / Ticket / User",
      "Swagger polish",
    ],
    task: "Tests + Swagger + refactor pass.",
    checklist: [
      "Tests added",
      "Swagger complete",
      "Refactoring done",
    ],
    isReviewDay: true,
    projects: [
      {
        id: "d6-backend",
        title: "Backend API",
        track: "backend",
        description: "Tests + docs polish",
        tasks: [
          { id: "d6-be-refactor", label: "Refactor oversized services / clear naming" },
          { id: "d6-be-test-auth", label: "Unit tests: AuthService (login)" },
          { id: "d6-be-test-ticket", label: "Unit tests: TicketService create/update/delete" },
          { id: "d6-be-test-user", label: "Unit tests: UserService" },
          { id: "d6-be-swagger", label: "Swagger: tags, summaries, responses, Bearer auth" },
        ],
      },
      {
        id: "d6-frontend",
        title: "Frontend App",
        track: "frontend",
        description: "UI cleanup + smoke tests",
        tasks: [
          { id: "d6-fe-refactor", label: "Refactor duplicated UI / hooks" },
          { id: "d6-fe-empty", label: "Empty / loading / error states everywhere" },
          { id: "d6-fe-smoke", label: "Smoke-test critical flows end-to-end" },
        ],
      },
    ],
  },
  {
    dayNumber: 7,
    week: 1,
    weekLabel: "Week 1 — Ticket System",
    title: "Production Ready",
    goal: "Secure, documented, deployed API + live frontend.",
    topics: [
      "Security hardening",
      "Indexes & query review",
      "README + deploy",
    ],
    task: "Deploy API + frontend and share Swagger URL.",
    checklist: [
      "Deployment complete",
      "Documentation complete",
      "API fully tested",
    ],
    isMiniProject: true,
    projects: [
      {
        id: "d7-backend",
        title: "Backend API",
        track: "backend",
        description: "Ship to production",
        tasks: [
          { id: "d7-be-security", label: "Helmet, CORS, env validation (rate limit optional)" },
          { id: "d7-be-perf", label: "Review Prisma queries + add indexes" },
          { id: "d7-be-readme", label: "README: overview, stack, install, env, schema, API docs" },
          { id: "d7-be-deploy", label: "Deploy API and verify all endpoints" },
          { id: "d7-be-swagger-url", label: "Share live Swagger URL" },
        ],
      },
      {
        id: "d7-frontend",
        title: "Frontend App",
        track: "frontend",
        description: "Ship the client",
        tasks: [
          { id: "d7-fe-env", label: "Production API URL + env config" },
          { id: "d7-fe-deploy", label: "Deploy frontend" },
          { id: "d7-fe-verify", label: "Verify auth + tickets + dashboard against live API" },
        ],
      },
    ],
  },
];

export const TICKET_ROADMAP: RoadmapDefinition = {
  id: TICKET_ROADMAP_ID,
  title: "7-Day NestJS Ticket System",
  description:
    "Build a full support-ticket API with NestJS + Prisma, and a separate frontend — auth, CRUD, workflow, analytics, notifications, tests, and deploy.",
  tags: ["NestJS", "Prisma", "JWT", "Tickets", "Frontend"],
  accent: "199 89% 48%",
  timeBlocks: DEFAULT_TIME_BLOCKS,
  weekGoals: TICKET_WEEK_GOALS,
  days: TICKET_ROADMAP_DAYS,
};
