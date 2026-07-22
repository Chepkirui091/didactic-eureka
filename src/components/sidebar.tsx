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
  Compass,
  X,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/roadmap", label: "Projects", icon: Compass },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="p-3 flex-1 min-h-0 overflow-y-auto">
      <ul className="space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
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
  );
}

function SidebarBrand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div
      className="p-4 border-b shrink-0 flex items-center justify-between"
      style={{ borderColor: "var(--border)" }}
    >
      <Link href="/" onClick={onNavigate} className="flex items-center gap-2 font-semibold text-lg">
        <Sparkles className="w-6 h-6" style={{ color: "hsl(var(--accent))" }} />
        <span>Habit Flow</span>
      </Link>
    </div>
  );
}

function SidebarFooter() {
  return (
    <div
      className="p-3 border-t shrink-0 text-xs text-[var(--muted)]"
      style={{ borderColor: "var(--border)" }}
    >
      Build consistency. Stay compassionate.
    </div>
  );
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex w-64 shrink-0 border-r flex-col sticky top-0 h-screen overflow-hidden"
        style={{
          background: "var(--sidebar-bg)",
          borderColor: "var(--border)",
        }}
      >
        <SidebarBrand />
        <SidebarNav />
        <SidebarFooter />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
            aria-label="Close menu"
          />
          <aside
            className="absolute left-0 top-0 h-full w-[min(280px,85vw)] flex flex-col shadow-xl"
            style={{
              background: "var(--sidebar-bg)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="p-4 border-b shrink-0 flex items-center justify-between"
              style={{ borderColor: "var(--border)" }}
            >
              <Link
                href="/"
                onClick={onMobileClose}
                className="flex items-center gap-2 font-semibold text-lg"
              >
                <Sparkles className="w-6 h-6" style={{ color: "hsl(var(--accent))" }} />
                <span>Habit Flow</span>
              </Link>
              <button
                type="button"
                onClick={onMobileClose}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarNav onNavigate={onMobileClose} />
            <SidebarFooter />
          </aside>
        </div>
      )}
    </>
  );
}
