"use client";

import { CheckCircle2, Circle, Server, MonitorSmartphone } from "lucide-react";
import type { EntryStatus, RoadmapProject } from "@/lib/types";

const TRACK_META: Record<
  RoadmapProject["track"],
  { label: string; icon: typeof Server; tone: string }
> = {
  backend: {
    label: "Backend",
    icon: Server,
    tone: "199 89% 48%",
  },
  frontend: {
    label: "Frontend",
    icon: MonitorSmartphone,
    tone: "262 83% 58%",
  },
  shared: {
    label: "Shared",
    icon: Circle,
    tone: "160 84% 39%",
  },
};

interface ProjectTaskListProps {
  projects: RoadmapProject[];
  taskStatuses: Record<string, EntryStatus>;
  onToggle: (taskId: string, next: EntryStatus) => void;
  disabled?: boolean;
}

export function ProjectTaskList({
  projects,
  taskStatuses,
  onToggle,
  disabled,
}: ProjectTaskListProps) {
  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const meta = TRACK_META[project.track];
        const Icon = meta.icon;
        const done = project.tasks.filter(
          (t) => taskStatuses[t.id] === "completed",
        ).length;
        const total = project.tasks.length;
        const pct = total ? Math.round((done / total) * 100) : 0;

        return (
          <section
            key={project.id}
            className="rounded-2xl border overflow-hidden"
            style={{
              background: "var(--card)",
              borderColor: "var(--card-border)",
            }}
          >
            <div
              className="px-5 py-4 border-b flex items-start justify-between gap-3"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{
                      color: `hsl(${meta.tone})`,
                      background: `hsl(${meta.tone} / 0.12)`,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {meta.label}
                  </span>
                </div>
                <h3 className="font-semibold text-base">{project.title}</h3>
                {project.description && (
                  <p className="text-sm text-[var(--muted)] mt-0.5">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold tabular-nums">
                  {done}/{total}
                </p>
                <p className="text-[11px] text-[var(--muted)]">{pct}%</p>
              </div>
            </div>

            <div
              className="h-1 w-full"
              style={{ background: "var(--border)" }}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  background: `hsl(${meta.tone})`,
                }}
              />
            </div>

            <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
              {project.tasks.map((task) => {
                const status = taskStatuses[task.id] ?? "pending";
                const completed = status === "completed";
                return (
                  <li key={task.id}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        onToggle(task.id, completed ? "pending" : "completed")
                      }
                      className="w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03] disabled:opacity-50"
                    >
                      {completed ? (
                        <CheckCircle2
                          className="w-5 h-5 shrink-0 mt-0.5"
                          style={{ color: `hsl(${meta.tone})` }}
                        />
                      ) : (
                        <Circle className="w-5 h-5 shrink-0 mt-0.5 text-[var(--muted)]" />
                      )}
                      <span
                        className={`text-sm leading-snug ${
                          completed
                            ? "text-[var(--muted)] line-through"
                            : "text-[var(--foreground)]"
                        }`}
                      >
                        {task.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
