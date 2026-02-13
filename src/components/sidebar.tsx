"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Bell,
  Trophy,
  Settings,
  Sparkles,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 shrink-0 border-r flex flex-col sticky top-0 h-screen overflow-hidden"
      style={{
        background: "var(--sidebar-bg)",
        borderColor: "var(--border)",
      }}
    >
      <div className="p-4 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Sparkles className="w-6 h-6" style={{ color: "hsl(var(--accent))" }} />
          <span>Habit Flow</span>
        </Link>
      </div>
      <nav className="p-3 flex-1 min-h-0 overflow-hidden">
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[hsl(var(--accent))] text-white"
                      : "text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-3 border-t shrink-0 text-xs text-[var(--muted)]" style={{ borderColor: "var(--border)" }}>
        Build consistency. Stay compassionate.
      </div>
    </aside>
  );
}
