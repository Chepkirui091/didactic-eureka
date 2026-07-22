"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Compass,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  BookOpen,
  Lock,
  Flame,
  ArrowLeft,
  ListChecks,
} from "lucide-react";
import { formatTimeRange, isDayUnlocked, countDayTasks, listDayTaskIds } from "@/lib/roadmap-core";
import { TimeBlockCard } from "@/components/time-block-card";
import { RoadmapActivityHeatmap } from "@/components/roadmap-activity-heatmap";
import { useRoadmap } from "@/hooks/use-roadmap";
import { getRoadmapDefinition } from "@/lib/roadmap-registry";

export default function RoadmapOverviewPage() {
  const params = useParams();
  const roadmapId = String(params.roadmapId ?? "");
  const def = getRoadmapDefinition(roadmapId);
  const { roadmap, loading, startRoadmap, updateBlock } = useRoadmap(roadmapId);

  if (!def) {
    return (
      <div className="space-y-4">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="w-4 h-4" />
          All projects
        </Link>
        <p className="text-[var(--muted)]">Project not found.</p>
      </div>
    );
  }

  if (loading) {
    return <p className="text-[var(--muted)]">Loading project…</p>;
  }

  if (!roadmap) {
    return <p className="text-[var(--muted)]">Could not load project.</p>;
  }

  const accent = roadmap.accent ?? "160 84% 39%";
  const currentDayData = roadmap.days.find((d) => d.dayNumber === roadmap.currentDay);
  const currentProgress = roadmap.progress.find((p) => p.dayNumber === roadmap.currentDay);
  const weeks = [...new Set(roadmap.days.map((d) => d.week))].sort((a, b) => a - b);
  const hasNestedProjects = roadmap.days.some((d) => (d.projects?.length ?? 0) > 0);

  return (
    <div className="space-y-8">
      <header>
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          All projects
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Compass className="w-7 h-7" style={{ color: `hsl(${accent})` }} />
              {roadmap.title}
            </h1>
            <p className="text-[var(--muted)] mt-1 max-w-2xl">{roadmap.description}</p>
            {roadmap.tags && roadmap.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {roadmap.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-md border text-[var(--muted)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {!roadmap.startedAt && (
            <button
              type="button"
              onClick={startRoadmap}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white shrink-0 hover:opacity-90"
              style={{ background: `hsl(${accent})` }}
            >
              Start Day 1
            </button>
          )}
        </div>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Current day", value: `Day ${roadmap.currentDay}` },
          {
            label: "Days done",
            value: `${roadmap.stats.daysCompleted}/${roadmap.totalDays}`,
          },
          {
            label: "Day streak",
            value: String(roadmap.streaks.days.current),
            sub: `Best: ${roadmap.streaks.days.longest}`,
            flame: true,
          },
          {
            label: "Study streak",
            value: String(roadmap.streaks.study.current),
            sub: `Best: ${roadmap.streaks.study.longest}`,
            flame: true,
          },
          hasNestedProjects
            ? {
                label: "Tasks done",
                value: `${roadmap.stats.tasksCompleted}/${roadmap.stats.totalTasks}`,
              }
            : {
                label: "Blocks done",
                value: `${roadmap.stats.blocksCompleted}/${roadmap.stats.totalBlocks}`,
              },
          {
            label: "Progress",
            value: `${roadmap.stats.completionPercentage}%`,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border p-4"
            style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
          >
            {stat.flame ? (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Flame className="w-3.5 h-3.5" />
                <p className="text-xs uppercase tracking-wide">{stat.label}</p>
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)] uppercase tracking-wide">{stat.label}</p>
            )}
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            {stat.sub && (
              <p className="text-xs text-[var(--muted)] mt-0.5">{stat.sub}</p>
            )}
          </div>
        ))}
      </section>

      <RoadmapActivityHeatmap activityByDate={roadmap.activityByDate} />

      {!hasNestedProjects && (
        <section
          className="rounded-xl border p-5"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" style={{ color: `hsl(${accent})` }} />
            Daily study schedule
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {roadmap.timeBlocks.map((block) => (
              <div
                key={block.id}
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="font-medium text-sm w-16">{block.label}</span>
                <span className="text-sm text-[var(--muted)]">
                  {formatTimeRange(block.startTime, block.endTime)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {currentDayData && currentProgress && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: `hsl(${accent})` }} />
              Today — Day {roadmap.currentDay}: {currentDayData.title}
            </h2>
            <Link
              href={`/roadmap/${roadmap.id}/${roadmap.currentDay}`}
              className="text-sm font-medium flex items-center gap-1 hover:underline"
              style={{ color: `hsl(${accent})` }}
            >
              Open day <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {currentDayData.goal && (
            <p className="text-sm text-[var(--muted)] mb-2">{currentDayData.goal}</p>
          )}
          <p className="text-sm text-[var(--muted)] mb-4">
            <span className="font-medium text-[var(--foreground)]">Focus:</span>{" "}
            {currentDayData.task}
          </p>

          {currentDayData.projects && currentDayData.projects.length > 0 ? (
            <div
              className="rounded-2xl border p-5"
              style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="w-5 h-5" style={{ color: `hsl(${accent})` }} />
                <h3 className="font-semibold">Nested projects</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {currentDayData.projects.map((project) => {
                  const done = project.tasks.filter(
                    (t) => currentProgress.taskStatuses?.[t.id] === "completed",
                  ).length;
                  return (
                    <div
                      key={project.id}
                      className="rounded-xl border p-4"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                        {project.track}
                      </p>
                      <p className="font-medium mt-0.5">{project.title}</p>
                      <p className="text-sm text-[var(--muted)] mt-2">
                        {done}/{project.tasks.length} tasks
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {roadmap.timeBlocks.map((block) => (
                <TimeBlockCard
                  key={block.id}
                  block={block}
                  status={currentProgress.blocks[block.id]}
                  compact
                  onComplete={() => updateBlock(roadmap.currentDay, block.id, "completed")}
                  onSkip={() => updateBlock(roadmap.currentDay, block.id, "skipped")}
                  onMiss={() => updateBlock(roadmap.currentDay, block.id, "missed")}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {weeks.map((week) => {
        const weekDays = roadmap.days.filter((d) => d.week === week);
        const weekGoal = roadmap.weekGoals?.[week];
        return (
          <section key={week}>
            <div className="mb-3">
              <h2 className="font-semibold text-lg">Week {week}</h2>
              {weekGoal && <p className="text-sm text-[var(--muted)]">{weekGoal}</p>}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {weekDays.map((day) => {
                const prog = roadmap.progress.find((p) => p.dayNumber === day.dayNumber);
                const done = prog?.dayCompleted;
                const unlocked = isDayUnlocked(
                  day.dayNumber,
                  roadmap.progress,
                  roadmap.totalDays,
                );
                const isCurrent = unlocked && day.dayNumber === roadmap.currentDay;
                const taskIds = listDayTaskIds(day);
                const tasksDone = taskIds.filter(
                  (id) => prog?.taskStatuses?.[id] === "completed",
                ).length;
                const blocksDone = prog
                  ? roadmap.timeBlocks.filter((b) => prog.blocks[b.id] === "completed")
                      .length
                  : 0;
                const unitsDone = taskIds.length > 0 ? tasksDone : blocksDone;
                const unitsTotal =
                  taskIds.length > 0 ? taskIds.length : roadmap.timeBlocks.length;

                const cardContent = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--muted)]">Day {day.dayNumber}</p>
                        <p className="font-medium truncate">{day.title}</p>
                      </div>
                      {!unlocked ? (
                        <Lock className="w-5 h-5 text-[var(--muted)] shrink-0" />
                      ) : done ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-[var(--muted)] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-2 line-clamp-2">
                      {!unlocked ? "Complete the previous day to unlock" : day.task}
                    </p>
                    {unlocked && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${unitsTotal ? (unitsDone / unitsTotal) * 100 : 0}%`,
                              background: `hsl(${accent})`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-[var(--muted)]">
                          {unitsDone}/{unitsTotal}
                        </span>
                      </div>
                    )}
                    {unlocked && countDayTasks(day) > 0 && (
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-400">
                        {day.projects?.length ?? 0} projects
                      </span>
                    )}
                    {unlocked && day.isMiniProject && (
                      <span className="inline-block mt-2 ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                        Mini project
                      </span>
                    )}
                    {unlocked && day.isReviewDay && (
                      <span className="inline-block mt-2 ml-1 text-xs px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-400">
                        Review
                      </span>
                    )}
                  </>
                );

                if (!unlocked) {
                  return (
                    <div
                      key={day.dayNumber}
                      className="rounded-xl border p-4 opacity-60 cursor-not-allowed"
                      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
                    >
                      {cardContent}
                    </div>
                  );
                }

                return (
                  <Link
                    key={day.dayNumber}
                    href={`/roadmap/${roadmap.id}/${day.dayNumber}`}
                    className={`rounded-xl border p-4 transition-colors hover:border-[hsl(${accent})] ${
                      isCurrent ? "ring-2" : ""
                    }`}
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--card-border)",
                      ...(isCurrent ? { boxShadow: `0 0 0 2px hsl(${accent})` } : {}),
                    }}
                  >
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5" style={{ color: `hsl(${accent})` }} />
          What you&apos;ll ship
        </h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm text-[var(--muted)]">
          {(hasNestedProjects
            ? [
                "JWT auth + role-based NestJS API",
                "Ticket CRUD, comments, and workflow",
                "Search, filters, pagination, dashboard",
                "Notifications + global error handling",
                "Separate frontend for the same flows",
                "Tests, Swagger, and production deploy",
              ]
            : [
                "Build full backend APIs with NestJS",
                "Design database schemas with Prisma",
                "Build booking logic (the hard part)",
                "Handle authentication + roles",
                "Connect to a Next.js frontend",
                "Build a real SaaS MVP",
              ]
          ).map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle2
                className="w-4 h-4 shrink-0"
                style={{ color: `hsl(${accent})` }}
              />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
