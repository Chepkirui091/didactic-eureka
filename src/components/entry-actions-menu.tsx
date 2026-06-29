"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Check, Minus, X } from "lucide-react";
import type { EntryStatus } from "@/lib/types";

interface EntryActionsMenuProps {
  status: EntryStatus;
  onComplete: () => void;
  onSkip: () => void;
  onMiss: () => void;
  size?: "sm" | "md";
}

const STATUS_STYLES: Record<
  EntryStatus,
  { label: string; active: string; idle: string; icon: typeof Check }
> = {
  completed: {
    label: "Done",
    active: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-500/40",
    idle: "border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10",
    icon: Check,
  },
  skipped: {
    label: "Skip",
    active: "bg-amber-500 text-white shadow-sm shadow-amber-500/30 ring-2 ring-amber-400/40",
    idle: "border border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10",
    icon: Minus,
  },
  missed: {
    label: "Miss",
    active: "bg-rose-600 text-white shadow-sm shadow-rose-600/30 ring-2 ring-rose-500/40",
    idle: "border border-rose-500/40 text-rose-700 dark:text-rose-400 hover:bg-rose-500/10",
    icon: X,
  },
  pending: {
    label: "Pending",
    active: "",
    idle: "",
    icon: Check,
  },
};

function ActionButton({
  action,
  current,
  onClick,
  btnClass,
}: {
  action: Exclude<EntryStatus, "pending">;
  current: EntryStatus;
  onClick: () => void;
  btnClass: string;
}) {
  const style = STATUS_STYLES[action];
  const Icon = style.icon;
  const isActive = current === action;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${btnClass} font-semibold inline-flex items-center gap-1 transition-all duration-200 ${
        isActive ? style.active : style.idle
      }`}
      aria-pressed={isActive}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{style.label}</span>
    </button>
  );
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
      ? "px-2.5 py-1.5 rounded-lg text-xs"
      : "px-3 py-2 rounded-lg text-sm";

  const run = (action: () => void) => {
    action();
    setOpen(false);
  };

  const desktopButtons = (
    <div className="hidden sm:flex gap-1.5">
      <ActionButton
        action="completed"
        current={status}
        onClick={onComplete}
        btnClass={btnClass}
      />
      <ActionButton
        action="skipped"
        current={status}
        onClick={onSkip}
        btnClass={btnClass}
      />
      <ActionButton
        action="missed"
        current={status}
        onClick={onMiss}
        btnClass={btnClass}
      />
    </div>
  );

  const mobileMenu = (
    <div className="relative sm:hidden" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={`p-2 rounded-lg transition-colors ${
          status === "completed"
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            : status === "skipped"
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              : status === "missed"
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                : "hover:bg-black/5 dark:hover:bg-white/5 text-[var(--foreground)]"
        }`}
        aria-label="Mark progress"
        aria-expanded={open}
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-1 w-44 rounded-xl border shadow-lg py-1 z-50"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          {(["completed", "skipped", "missed"] as const).map((action) => {
            const style = STATUS_STYLES[action];
            const Icon = style.icon;
            const isActive = status === action;
            return (
              <button
                key={action}
                type="button"
                onClick={() =>
                  run(
                    action === "completed"
                      ? onComplete
                      : action === "skipped"
                        ? onSkip
                        : onMiss,
                  )
                }
                className={`flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left transition-colors ${
                  isActive ? "font-semibold" : ""
                } hover:bg-black/5 dark:hover:bg-white/5`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    action === "completed"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : action === "skipped"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-rose-600 dark:text-rose-400"
                  }`}
                />
                {style.label}
                {isActive && <span className="ml-auto text-xs opacity-70">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      {desktopButtons}
      {mobileMenu}
    </>
  );
}
