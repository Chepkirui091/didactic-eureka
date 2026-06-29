"use client";

import { BookOpen, Hammer, RefreshCw, TestTube, CheckCircle2 } from "lucide-react";
import type { EntryStatus, TimeBlockConfig } from "@/lib/types";
import { formatTimeRange } from "@/lib/nestjs-roadmap-data";
import { EntryActionsMenu } from "@/components/entry-actions-menu";

const ICONS = {
  learn: BookOpen,
  rebuild: RefreshCw,
  build: Hammer,
  test: TestTube,
} as const;

const BLOCK_ACCENTS: Record<
  TimeBlockConfig["id"],
  { bg: string; icon: string; border: string }
> = {
  learn: {
    bg: "bg-sky-500/15",
    icon: "text-sky-600 dark:text-sky-400",
    border: "border-l-sky-500",
  },
  rebuild: {
    bg: "bg-violet-500/15",
    icon: "text-violet-600 dark:text-violet-400",
    border: "border-l-violet-500",
  },
  build: {
    bg: "bg-orange-500/15",
    icon: "text-orange-600 dark:text-orange-400",
    border: "border-l-orange-500",
  },
  test: {
    bg: "bg-teal-500/15",
    icon: "text-teal-600 dark:text-teal-400",
    border: "border-l-teal-500",
  },
};

const STATUS_BORDER: Record<EntryStatus, string> = {
  completed: "border-l-emerald-500 bg-emerald-500/[0.04]",
  skipped: "border-l-amber-500 bg-amber-500/[0.04]",
  missed: "border-l-rose-500 bg-rose-500/[0.04]",
  pending: "",
};

export function TimeBlockCard({
  block,
  status,
  onComplete,
  onSkip,
  onMiss,
  compact,
}: {
  block: TimeBlockConfig;
  status: EntryStatus;
  onComplete: () => void;
  onSkip: () => void;
  onMiss: () => void;
  compact?: boolean;
}) {
  const Icon = ICONS[block.id];
  const accent = BLOCK_ACCENTS[block.id];
  const statusBorder = STATUS_BORDER[status];

  return (
    <div
      className={`rounded-xl border flex items-center gap-2 sm:gap-4 border-l-4 transition-colors duration-200 ${
        status === "pending" ? accent.border : ""
      } ${statusBorder} ${compact ? "p-3" : "p-3 sm:p-4"}`}
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
    >
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${accent.bg}`}
      >
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${accent.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className="font-medium text-sm sm:text-base">{block.label}</p>
          <span className="text-xs text-[var(--muted)]">
            {formatTimeRange(block.startTime, block.endTime)}
          </span>
          {status === "completed" && (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>
        {!compact && (
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5 line-clamp-2">
            {block.description}
          </p>
        )}
      </div>
      <EntryActionsMenu
        status={status}
        onComplete={onComplete}
        onSkip={onSkip}
        onMiss={onMiss}
        size="sm"
      />
    </div>
  );
}
