"use client";

import { BookOpen, Hammer, RefreshCw, TestTube } from "lucide-react";
import type { EntryStatus, TimeBlockConfig } from "@/lib/types";
import { formatTimeRange } from "@/lib/nestjs-roadmap-data";
import { EntryActionsMenu } from "@/components/entry-actions-menu";

const ICONS = {
  learn: BookOpen,
  rebuild: RefreshCw,
  build: Hammer,
  test: TestTube,
} as const;

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

  return (
    <div
      className={`rounded-xl border flex items-center gap-2 sm:gap-4 ${compact ? "p-3" : "p-3 sm:p-4"}`}
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
    >
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "hsl(var(--accent) / 0.15)" }}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "hsl(var(--accent))" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className="font-medium text-sm sm:text-base">{block.label}</p>
          <span className="text-xs text-[var(--muted)]">
            {formatTimeRange(block.startTime, block.endTime)}
          </span>
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
