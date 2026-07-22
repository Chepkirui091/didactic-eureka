"use client";

import Link from "next/link";
import {
  Compass,
  ChevronRight,
  Layers,
  Server,
  MonitorSmartphone,
  Sparkles,
} from "lucide-react";
import { useRoadmapList } from "@/hooks/use-roadmap-list";

export default function ProjectsIndexPage() {
  const { projects, loading } = useRoadmapList();

  if (loading) {
    return <p className="text-[var(--muted)]">Loading projects…</p>;
  }

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-3xl border px-6 py-8 sm:px-8"
        style={{
          borderColor: "var(--card-border)",
          background:
            "linear-gradient(135deg, hsl(var(--accent) / 0.12) 0%, var(--card) 45%, hsl(199 89% 48% / 0.08) 100%)",
        }}
      >
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)] mb-3">
            Learning projects
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
            <Compass className="w-8 h-8" style={{ color: "hsl(var(--accent))" }} />
            Build in public
          </h1>
          <p className="mt-3 text-[var(--muted)] text-base leading-relaxed">
            Pick a project. Each day breaks into nested backend and frontend
            checklists so you can ship both sides without mixing them up.
          </p>
        </div>
        <Sparkles
          className="absolute -right-4 -top-4 w-40 h-40 opacity-[0.07]"
          style={{ color: "hsl(var(--accent))" }}
        />
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {projects.map((project) => {
          const started = Boolean(project.startedAt);
          return (
            <Link
              key={project.id}
              href={`/roadmap/${project.id}`}
              className="group relative rounded-3xl border p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: "var(--card)",
                borderColor: "var(--card-border)",
                boxShadow: "0 0 0 1px transparent",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1 rounded-t-3xl opacity-90"
                style={{ background: `hsl(${project.accent})` }}
              />

              <div className="flex items-start justify-between gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: `hsl(${project.accent} / 0.15)` }}
                >
                  <Layers
                    className="w-5 h-5"
                    style={{ color: `hsl(${project.accent})` }}
                  />
                </div>
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: started
                      ? `hsl(${project.accent} / 0.12)`
                      : "var(--border)",
                    color: started
                      ? `hsl(${project.accent})`
                      : "var(--muted)",
                  }}
                >
                  {started
                    ? `Day ${project.currentDay} · ${project.completionPercentage}%`
                    : "Not started"}
                </span>
              </div>

              <h2 className="text-xl font-bold tracking-tight group-hover:underline decoration-[hsl(var(--accent))] underline-offset-4">
                {project.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed line-clamp-3">
                {project.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-md border text-[var(--muted)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {project.hasProjects && (
                <div className="mt-5 flex items-center gap-4 text-xs text-[var(--muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-sky-500" />
                    Backend track
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MonitorSmartphone className="w-3.5 h-3.5 text-violet-500" />
                    Frontend track
                  </span>
                </div>
              )}

              <div
                className="mt-5 pt-4 border-t flex items-center justify-between"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="text-sm text-[var(--muted)]">
                  {project.daysCompleted}/{project.totalDays} days done
                </span>
                <span
                  className="inline-flex items-center gap-1 text-sm font-medium"
                  style={{ color: `hsl(${project.accent})` }}
                >
                  Open
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>

              <div
                className="mt-3 h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--border)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${project.completionPercentage}%`,
                    background: `hsl(${project.accent})`,
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
