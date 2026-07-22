"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ListChecks,
  FileText,
  Hammer,
  BookOpen,
  Save,
  Lock,
  Flame,
} from "lucide-react";
import type { EntryStatus, TimeBlockId } from "@/lib/types";
import { listDayTaskIds } from "@/lib/roadmap-core";
import { TimeBlockCard } from "@/components/time-block-card";
import { ProjectTaskList } from "@/components/project-task-list";
import { useRoadmap } from "@/hooks/use-roadmap";
import { getRoadmapDefinition } from "@/lib/roadmap-registry";

export default function RoadmapDayPage() {
  const params = useParams();
  const roadmapId = String(params.roadmapId ?? "");
  const dayNumber = Number.parseInt(String(params.day), 10);
  const def = getRoadmapDefinition(roadmapId);
  const { roadmap, loading, updateBlock, updateTask, saveDayNotes, checkDayAccess } =
    useRoadmap(roadmapId);

  const day = roadmap?.days.find((d) => d.dayNumber === dayNumber);
  const progress = roadmap?.progress.find((p) => p.dayNumber === dayNumber);
  const access = checkDayAccess(dayNumber);
  const accent = roadmap?.accent ?? def?.accent ?? "160 84% 39%";

  const [notes, setNotes] = useState("");
  const [builtItems, setBuiltItems] = useState("");
  const [learnNotes, setLearnNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (progress) {
      setNotes(progress.notes);
      setBuiltItems(progress.builtItems);
      setLearnNotes(progress.learnNotes);
    }
  }, [progress?.notes, progress?.builtItems, progress?.learnNotes, progress?.updatedAt]);

  const handleSaveNotes = () => {
    setSaving(true);
    setSaved(false);
    saveDayNotes(dayNumber, { notes, builtItems, learnNotes })
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      })
      .finally(() => setSaving(false));
  };

  const handleBlockUpdate = (blockId: TimeBlockId, status: EntryStatus) => {
    updateBlock(dayNumber, blockId, status);
  };

  if (!def || Number.isNaN(dayNumber) || dayNumber < 1 || dayNumber > def.days.length) {
    return <p className="text-[var(--muted)]">Invalid day.</p>;
  }

  if (loading) {
    return <p className="text-[var(--muted)]">Loading day {dayNumber}…</p>;
  }

  if (!access.allowed) {
    return (
      <div className="space-y-6 max-w-lg">
        <Link
          href={`/roadmap/${roadmapId}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to project
        </Link>
        <div
          className="rounded-xl border p-8 text-center"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: `hsl(${accent} / 0.15)` }}
          >
            <Lock className="w-7 h-7" style={{ color: `hsl(${accent})` }} />
          </div>
          <h1 className="text-xl font-bold">Day {dayNumber} is locked</h1>
          <p className="text-[var(--muted)] mt-2 text-sm">{access.message}</p>
          {access.requiredDay && (
            <Link
              href={`/roadmap/${roadmapId}/${access.requiredDay}`}
              className="inline-block mt-6 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90"
              style={{ background: `hsl(${accent})` }}
            >
              Go to Day {access.requiredDay}
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!day || !progress || !roadmap) {
    return <p className="text-[var(--muted)]">Day not found.</p>;
  }

  const taskIds = listDayTaskIds(day);
  const hasProjects = (day.projects?.length ?? 0) > 0;
  const tasksDone = taskIds.filter(
    (id) => progress.taskStatuses?.[id] === "completed",
  ).length;
  const blocksDone = roadmap.timeBlocks.filter(
    (b) => progress.blocks[b.id] === "completed",
  ).length;
  const unitsDone = hasProjects ? tasksDone : blocksDone;
  const unitsTotal = hasProjects ? taskIds.length : roadmap.timeBlocks.length;
  const prevDay = dayNumber > 1 ? dayNumber - 1 : null;
  const nextDay = dayNumber < roadmap.totalDays ? dayNumber + 1 : null;
  const weekGoal = roadmap.weekGoals?.[day.week];
  const streaks = roadmap.streaks;

  return (
    <div className="space-y-8">
      <header>
        <Link
          href={`/roadmap/${roadmapId}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to project
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted)]">
              {day.weekLabel}
              {weekGoal ? ` · ${weekGoal}` : ""}
            </p>
            <h1 className="text-2xl font-bold mt-1">
              Day {day.dayNumber}: {day.title}
            </h1>
            {day.goal && (
              <p className="text-sm text-[var(--muted)] mt-2 max-w-2xl">{day.goal}</p>
            )}
            {day.isMiniProject && (
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                Mini project day
              </span>
            )}
            {day.isReviewDay && (
              <span className="inline-block mt-2 ml-2 text-xs px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-400">
                Review day
              </span>
            )}
          </div>
          {progress.dayCompleted && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
              Day complete
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-[var(--border)] overflow-hidden w-32 sm:w-48">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${unitsTotal ? (unitsDone / unitsTotal) * 100 : 0}%`,
                  background: `hsl(${accent})`,
                }}
              />
            </div>
            <span className="text-sm text-[var(--muted)]">
              {unitsDone}/{unitsTotal} {hasProjects ? "tasks" : "blocks"}
            </span>
          </div>
          {streaks && (
            <>
              <span className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                <Flame className="w-4 h-4" />
                {streaks.study.current} day study streak
              </span>
              <span className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
                <Flame className="w-4 h-4 text-amber-600/60 dark:text-amber-400/60" />
                {streaks.days.current} day{streaks.days.current === 1 ? "" : "s"} finished in a
                row
              </span>
            </>
          )}
        </div>
      </header>

      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5" style={{ color: `hsl(${accent})` }} />
          What to learn
        </h2>
        <ul className="space-y-1.5 text-sm">
          {day.topics.map((topic) => (
            <li key={topic} className="flex items-start gap-2">
              <span className="text-[var(--muted)] mt-0.5">•</span>
              {topic}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <h2 className="font-semibold flex items-center gap-2 mb-2">
          <ListChecks className="w-5 h-5" style={{ color: `hsl(${accent})` }} />
          Today&apos;s focus
        </h2>
        <p className="text-sm">{day.task}</p>
        {day.checklist && day.checklist.length > 0 && (
          <ul className="mt-4 grid sm:grid-cols-2 gap-2">
            {day.checklist.map((item) => (
              <li
                key={item}
                className="text-xs px-2.5 py-1.5 rounded-lg border text-[var(--muted)]"
                style={{ borderColor: "var(--border)" }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </section>

      {hasProjects && day.projects ? (
        <section>
          <h2 className="font-semibold text-lg mb-4">
            Projects — backend & frontend stay separate
          </h2>
          <ProjectTaskList
            projects={day.projects}
            taskStatuses={progress.taskStatuses ?? {}}
            onToggle={(taskId, next) => updateTask(dayNumber, taskId, next)}
          />
        </section>
      ) : (
        <section>
          <h2 className="font-semibold text-lg mb-4">
            Daily blocks — mark what you&apos;ve done
          </h2>
          <div className="space-y-3">
            {roadmap.timeBlocks.map((block) => (
              <TimeBlockCard
                key={block.id}
                block={block}
                status={progress.blocks[block.id]}
                onComplete={() => handleBlockUpdate(block.id, "completed")}
                onSkip={() => handleBlockUpdate(block.id, "skipped")}
                onMiss={() => handleBlockUpdate(block.id, "missed")}
              />
            ))}
          </div>
        </section>
      )}

      <section
        className="rounded-xl border p-5 space-y-5"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <h2 className="font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" style={{ color: `hsl(${accent})` }} />
          Notes & what you built
        </h2>

        <div>
          <label htmlFor="learnNotes" className="block text-sm font-medium mb-1.5">
            Learn session notes
          </label>
          <textarea
            id="learnNotes"
            value={learnNotes}
            onChange={(e) => setLearnNotes(e.target.value)}
            rows={3}
            placeholder="Concepts you studied, resources, questions…"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent resize-y"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        <div>
          <label
            htmlFor="builtItems"
            className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"
          >
            <Hammer className="w-4 h-4" />
            What I built today
          </label>
          <textarea
            id="builtItems"
            value={builtItems}
            onChange={(e) => setBuiltItems(e.target.value)}
            rows={4}
            placeholder="e.g. JWT auth guard, ticket create form, comment thread…"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent resize-y"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1.5">
            General notes & reflections
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Weak areas, bugs you fixed, tomorrow's focus…"
            className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent resize-y"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        <button
          type="button"
          onClick={handleSaveNotes}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          style={{ background: `hsl(${accent})` }}
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : saved ? "Saved!" : "Save notes"}
        </button>
      </section>

      <nav className="flex justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
        {prevDay ? (
          <Link
            href={`/roadmap/${roadmapId}/${prevDay}`}
            className="text-sm font-medium hover:underline"
            style={{ color: `hsl(${accent})` }}
          >
            ← Day {prevDay}
          </Link>
        ) : (
          <span />
        )}
        {nextDay && progress.dayCompleted ? (
          <Link
            href={`/roadmap/${roadmapId}/${nextDay}`}
            className="text-sm font-medium hover:underline"
            style={{ color: `hsl(${accent})` }}
          >
            Day {nextDay} →
          </Link>
        ) : nextDay ? (
          <span className="text-sm text-[var(--muted)] flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            Finish this day to unlock Day {nextDay}
          </span>
        ) : (
          <span className="text-sm text-[var(--muted)]">Project complete 🎉</span>
        )}
      </nav>
    </div>
  );
}
