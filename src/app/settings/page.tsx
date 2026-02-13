"use client";

import { useTheme, type Theme, type Accent } from "@/components/theme-provider";
import { Sun, Moon, Monitor, Palette } from "lucide-react";

const ACCENTS: { value: Accent; label: string }[] = [
  { value: "emerald", label: "Emerald" },
  { value: "violet", label: "Violet" },
  { value: "amber", label: "Amber" },
  { value: "sky", label: "Sky" },
  { value: "rose", label: "Rose" },
];

export default function SettingsPage() {
  const { theme, setTheme, accent, setAccent } = useTheme();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[var(--muted)] mt-1">
          Customize appearance and preferences.
        </p>
      </header>

      {/* Theme */}
      <section>
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <Sun className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
          Theme
        </h2>
        <div className="flex gap-2">
          {(
            [
              { value: "light" as Theme, label: "Light", icon: Sun },
              { value: "dark" as Theme, label: "Dark", icon: Moon },
              { value: "system" as Theme, label: "System", icon: Monitor },
            ] as const
          ).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                theme === value
                  ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-white"
                  : "border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Accent color */}
      <section>
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <Palette className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
          Accent color
        </h2>
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setAccent(value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                accent === value
                  ? "border-[hsl(var(--accent))] ring-2 ring-[hsl(var(--accent))] ring-offset-2"
                  : "border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Preferences placeholder */}
      <section>
        <h2 className="font-semibold mb-3">Preferences</h2>
        <div
          className="rounded-xl border p-4 text-sm text-[var(--muted)]"
          style={{ borderColor: "var(--border)" }}
        >
          <p>Week start day, timezone, font size, and accessibility options can be added here and stored in user preferences.</p>
        </div>
      </section>
    </div>
  );
}
