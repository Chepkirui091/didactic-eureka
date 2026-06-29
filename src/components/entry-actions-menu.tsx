"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Check, Minus, Circle } from "lucide-react";
import type { EntryStatus } from "@/lib/types";

interface EntryActionsMenuProps {
  status: EntryStatus;
  onComplete: () => void;
  onSkip: () => void;
  onMiss: () => void;
  size?: "sm" | "md";
}

function statusIcon(status: EntryStatus) {
  switch (status) {
    case "completed":
      return <Check className="w-4 h-4 text-green-600 dark:text-green-400" />;
    case "skipped":
      return <Minus className="w-4 h-4 text-[var(--muted)]" />;
    default:
      return <Circle className="w-4 h-4 text-[var(--muted)]" />;
  }
}

export function EntryActionsMenu({
  status,
  onComplete,
  onSkip,
  onMiss,
  size = "md",
}: EntryActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const btnClass =
    size === "sm"
      ? "px-2.5 py-1 rounded-lg text-xs"
      : "px-3 py-1.5 rounded-lg text-sm";

  if (status !== "pending") {
    return (
      <span className="flex items-center gap-1.5 text-sm text-[var(--muted)] capitalize">
        {statusIcon(status)}
        <span className="hidden sm:inline capitalize">{status}</span>
      </span>
    );
  }

  const run = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <>
      {/* Desktop: inline buttons */}
      <div className={`hidden sm:flex gap-1 ${size === "sm" ? "" : ""}`}>
        <button
          type="button"
          onClick={onComplete}
          className={`${btnClass} font-medium text-white hover:opacity-90`}
          style={{ background: "hsl(var(--accent))" }}
        >
          Done
        </button>
        <button
          type="button"
          onClick={onSkip}
          className={`${btnClass} border hover:bg-black/5 dark:hover:bg-white/5`}
          style={{ borderColor: "var(--border)" }}
        >
          Skip
        </button>
        <button
          type="button"
          onClick={onMiss}
          className={`${btnClass} text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5`}
        >
          Miss
        </button>
      </div>

      {/* Mobile: more menu */}
      <div className="relative sm:hidden" ref={ref}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--foreground)]"
          aria-label="Habit actions"
          aria-expanded={open}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        {open && (
          <div
            className="absolute right-0 mt-1 w-40 rounded-xl border shadow-lg py-1 z-50"
            style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
          >
            <button
              type="button"
              onClick={() => run(onComplete)}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Check className="w-4 h-4" style={{ color: "hsl(var(--accent))" }} />
              Done
            </button>
            <button
              type="button"
              onClick={() => run(onSkip)}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Minus className="w-4 h-4 text-[var(--muted)]" />
              Skip
            </button>
            <button
              type="button"
              onClick={() => run(onMiss)}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Circle className="w-4 h-4 text-[var(--muted)]" />
              Miss
            </button>
          </div>
        )}
      </div>
    </>
  );
}
