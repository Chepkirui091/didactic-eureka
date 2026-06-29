"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
} from "lucide-react";
import type { RoadmapOverview } from "@/lib/types";
import { TIME_BLOCKS, WEEK_GOALS, formatTimeRange, isDayUnlocked } from "@/lib/nestjs-roadmap-data";
import { TimeBlockCard } from "@/components/time-block-card";
import { RoadmapActivityHeatmap } from "@/components/roadmap-activity-heatmap";

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<RoadmapOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch("/api/roadmap")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setRoadmap(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStart = () => {
    fetch("/api/roadmap", { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setRoadmap(data));
  };

  if (loading) {
    return <p className="text-[var(--muted)]">Loading roadmap…</p>;
  }

  if (!roadmap) {
    return <p className="text-[var(--muted)]">Could not load roadmap.</p>;
  }

  const currentDayData = roadmap.days.find((d) => d.dayNumber === roadmap.currentDay);
  const currentProgress = roadmap.progress.find((p) => p.dayNumber === roadmap.currentDay);
  const weeks = [1, 2, 3, 4];

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Compass className="w-7 h-7" style={{ color: "hsl(var(--accent))" }} />
              {roadmap.title}
            </h1>
            <p className="text-[var(--muted)] mt-1 max-w-2xl">{roadmap.description}</p>
          </div>
          {!roadmap.startedAt && (
            <button
              type="button"
              onClick={handleStart}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white shrink-0 hover:opacity-90"
              style={{ background: "hsl(var(--accent))" }}
            >
              Start Day 1
            </button>
          )}
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Current day</p>
          <p className="text-2xl font-bold mt-1">Day {roadmap.currentDay}</p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Days done</p>
          <p className="text-2xl font-bold mt-1">
            {roadmap.stats.daysCompleted}/{roadmap.totalDays}
          </p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Flame className="w-3.5 h-3.5" />
            <p className="text-xs uppercase tracking-wide">Day streak</p>
          </div>
          <p className="text-2xl font-bold mt-1">{roadmap.streaks.days.current}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Best: {roadmap.streaks.days.longest}
          </p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Flame className="w-3.5 h-3.5" />
            <p className="text-xs uppercase tracking-wide">Study streak</p>
          </div>
          <p className="text-2xl font-bold mt-1">{roadmap.streaks.study.current}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Best: {roadmap.streaks.study.longest}
          </p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Blocks done</p>
          <p className="text-2xl font-bold mt-1">
            {roadmap.stats.blocksCompleted}/{roadmap.stats.totalBlocks}
          </p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Progress</p>
          <p className="text-2xl font-bold mt-1">{roadmap.stats.completionPercentage}%</p>
        </div>
      </section>

      <RoadmapActivityHeatmap activityByDate={roadmap.activityByDate} />

      {/* Daily schedule */}
      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
          Daily study schedule
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {TIME_BLOCKS.map((block) => (
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
        <p className="text-xs text-[var(--muted)] mt-3">
          Learn 5:30–7:30 AM · Rebuild 9:30–10:00 AM · Build 7:30–9:30 PM · Test 9:30–10:00 PM
        </p>
      </section>

      {/* Today's focus */}
      {currentDayData && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
              Today — Day {roadmap.currentDay}: {currentDayData.title}
            </h2>
            <Link
              href={`/roadmap/${roadmap.currentDay}`}
              className="text-sm font-medium flex items-center gap-1 hover:underline"
              style={{ color: "hsl(var(--accent))" }}
            >
              Open day <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-sm text-[var(--muted)] mb-4">
            <span className="font-medium text-[var(--foreground)]">Task:</span>{" "}
            {currentDayData.task}
          </p>
          {currentProgress && (
            <div className="space-y-2">
              {TIME_BLOCKS.map((block) => (
                <TimeBlockCard
                  key={block.id}
                  block={block}
                  status={currentProgress.blocks[block.id]}
                  compact
                  onComplete={() => {}}
                  onSkip={() => {}}
                  onMiss={() => {}}
                />
              ))}
            </div>
          )}
          <p className="text-xs text-[var(--muted)] mt-2">
            Mark blocks done on the{" "}
            <Link href={`/roadmap/${roadmap.currentDay}`} className="underline">
              day detail page
            </Link>
            .
          </p>
        </section>
      )}

      {/* 30-day grid by week */}
      {weeks.map((week) => {
        const weekDays = roadmap.days.filter((d) => d.week === week);
        return (
          <section key={week}>
            <div className="mb-3">
              <h2 className="font-semibold text-lg">Week {week}</h2>
              <p className="text-sm text-[var(--muted)]">{WEEK_GOALS[week]}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {weekDays.map((day) => {
                const prog = roadmap.progress.find((p) => p.dayNumber === day.dayNumber);
                const done = prog?.dayCompleted;
                const unlocked = isDayUnlocked(day.dayNumber, roadmap.progress);
                const isCurrent = unlocked && day.dayNumber === roadmap.currentDay;
                const blocksDone = prog
                  ? TIME_BLOCKS.filter((b) => prog.blocks[b.id] === "completed").length
                  : 0;

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
                              width: `${(blocksDone / TIME_BLOCKS.length) * 100}%`,
                              background: "hsl(var(--accent))",
                            }}
                          />
                        </div>
                        <span className="text-xs text-[var(--muted)]">
                          {blocksDone}/{TIME_BLOCKS.length}
                        </span>
                      </div>
                    )}
                    {unlocked && day.isMiniProject && (
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                        Mini project
                      </span>
                    )}
                    {unlocked && day.isReviewDay && (
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-400">
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
                      title={`Complete Day ${day.dayNumber - 1} first`}
                    >
                      {cardContent}
                    </div>
                  );
                }

                return (
                  <Link
                    key={day.dayNumber}
                    href={`/roadmap/${day.dayNumber}`}
                    className={`rounded-xl border p-4 transition-colors hover:border-[hsl(var(--accent))] ${
                      isCurrent ? "ring-2 ring-[hsl(var(--accent))]" : ""
                    }`}
                    style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
                  >
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Outcomes */}
      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
          After 30 days you will be able to
        </h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm text-[var(--muted)]">
          {[
            "Build full backend APIs with NestJS",
            "Design database schemas with Prisma",
            "Build booking logic (the hard part)",
            "Handle authentication + roles",
            "Connect to a Next.js frontend",
            "Build a real SaaS MVP",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--accent))" }} />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
