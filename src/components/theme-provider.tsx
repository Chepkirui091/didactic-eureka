"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type Accent = "emerald" | "violet" | "amber" | "sky" | "rose";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  accent: Accent;
  setAccent: (a: Accent) => void;
  resolved: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [accent, setAccent] = useState<Accent>("emerald");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      localStorage.setItem("habit-theme", t);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("habit-theme") as Theme | null;
    if (stored && ["light", "dark", "system"].includes(stored)) setThemeState(stored);
    const storedAccent = localStorage.getItem("habit-accent") as Accent | null;
    if (storedAccent && ["emerald", "violet", "amber", "sky", "rose"].includes(storedAccent)) setAccent(storedAccent);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    const resolvedTheme: "light" | "dark" =
      theme === "system"
        ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : theme;
    setResolved(resolvedTheme);
    root.classList.add(resolvedTheme);
    root.setAttribute("data-accent", accent);
    if (typeof window !== "undefined") localStorage.setItem("habit-accent", accent);
  }, [theme, accent]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
