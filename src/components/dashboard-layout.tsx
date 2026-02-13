"use client";

import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
