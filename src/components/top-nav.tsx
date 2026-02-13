"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Sun,
  Moon,
  Monitor,
  User,
  Settings,
  LogOut,
  Search,
  Sparkles,
} from "lucide-react";
import { useTheme } from "./theme-provider";
import type { Theme } from "./theme-provider";

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

// Dummy notifications
const NOTIFICATIONS = [
  { id: "1", title: "Reminder", body: "Meditate — 7:30 AM", time: "2m ago", read: false },
  { id: "2", title: "Streak", body: "You're on a 5-day streak for Drink Water!", time: "1h ago", read: true },
  { id: "3", title: "Recap", body: "You completed 3 of 5 habits yesterday.", time: "Yesterday", read: true },
];

export function TopNav() {
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        notifRef.current && !notifRef.current.contains(e.target as Node) &&
        profileRef.current && !profileRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 lg:px-6 border-b shrink-0"
      style={{ background: "var(--background)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] lg:hidden"
        >
          <Sparkles className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
          Habit Flow
        </Link>
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border w-64 max-w-[240px]" style={{ borderColor: "var(--border)" }}>
          <Search className="w-4 h-4 text-[var(--muted)] shrink-0" />
          <input
            type="search"
            placeholder="Search habits..."
            className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Theme toggle */}
        <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              title={label}
              className={`p-2 sm:px-3 transition-colors ${
                theme === value
                  ? "text-white"
                  : "text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              style={theme === value ? { background: "hsl(var(--accent))" } : undefined}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            className="relative p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--foreground)]"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: "hsl(var(--accent))" }}
              />
            )}
          </button>
          {notifOpen && (
            <div
              className="absolute right-0 mt-1 w-72 rounded-xl border shadow-lg py-2 z-50"
              style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
            >
              <div className="px-4 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="font-semibold text-sm">Notifications</p>
              </div>
              <ul className="max-h-64 overflow-y-auto">
                {NOTIFICATIONS.map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer ${!n.read ? "bg-[hsl(var(--accent))]/5" : ""}`}
                  >
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{n.body}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">{n.time}</p>
                  </li>
                ))}
              </ul>
              {NOTIFICATIONS.length === 0 && (
                <p className="px-4 py-6 text-sm text-[var(--muted)] text-center">No notifications</p>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 p-1.5 pr-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Profile menu"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ background: "hsl(var(--accent))" }}
            >
              <User className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline text-sm font-medium">Profile</span>
          </button>
          {profileOpen && (
            <div
              className="absolute right-0 mt-1 w-56 rounded-xl border shadow-lg py-2 z-50"
              style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
            >
              <div className="px-4 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-sm font-medium">Demo User</p>
                <p className="text-xs text-[var(--muted)]">demo@habitflow.app</p>
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                onClick={() => setProfileOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button
                type="button"
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
