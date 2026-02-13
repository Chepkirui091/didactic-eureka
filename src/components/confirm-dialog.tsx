"use client";

import { useState, useRef, useEffect } from "react";
import { X, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

type Variant = "danger" | "default";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  /** Shown after confirm succeeds, before closing */
  successTitle?: string;
  successMessage?: string;
  /** Called when dialog is closing after a successful confirm (e.g. to redirect). */
  onSuccess?: () => void;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  successTitle = "Done",
  successMessage = "Action completed successfully.",
  onSuccess,
  onConfirm,
}: ConfirmDialogProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const handleConfirm = async () => {
    setStatus("loading");
    try {
      await onConfirm();
      setStatus("success");
      successTimeoutRef.current = setTimeout(() => {
        successTimeoutRef.current = null;
        setStatus("idle");
        onSuccess?.();
        onClose();
      }, 1600);
    } catch {
      setStatus("idle");
    }
  };

  const handleClose = () => {
    if (status === "loading") return;
    setStatus("idle");
    onClose();
  };

  if (!open) return null;

  const isDanger = variant === "danger";
  const displayTitle = status === "success" ? successTitle : title;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        onKeyDown={(e) => e.key === "Escape" && handleClose()}
      />
      <div
        className="relative w-full max-w-lg rounded-2xl border shadow-xl overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        {/* Header: same as add/edit modals */}
        <div
          className="sticky top-0 flex items-center justify-between p-4 border-b bg-inherit z-10"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 id="confirm-dialog-title" className="text-lg font-semibold">
            {displayTitle}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={status === "loading"}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--muted)] disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: same padding as add/edit modals */}
        <div className="p-4">
          {status === "success" ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: "hsl(var(--accent) / 0.15)" }}
              >
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-[var(--muted)]">{successMessage}</p>
            </div>
          ) : (
            <>
              <div className="flex gap-4">
                <div
                  className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center ${
                    isDanger ? "bg-red-500/10" : "bg-[hsl(var(--accent))]/10"
                  }`}
                >
                  <AlertTriangle
                    className={`w-6 h-6 ${isDanger ? "text-red-600 dark:text-red-400" : ""}`}
                    style={!isDanger ? { color: "hsl(var(--accent))" } : undefined}
                  />
                </div>
                <p className="text-sm text-[var(--muted)] pt-2">{message}</p>
              </div>
              <div className="flex justify-end gap-2 pt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={status === "loading"}
                  className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
                  style={{ borderColor: "var(--border)" }}
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={status === "loading"}
                  className={`px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 flex items-center justify-center gap-2 ${
                    isDanger
                      ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                      : ""
                  }`}
                  style={!isDanger ? { background: "hsl(var(--accent))" } : undefined}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Please wait…</span>
                    </>
                  ) : (
                    confirmLabel
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
