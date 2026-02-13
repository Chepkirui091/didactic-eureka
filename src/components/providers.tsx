"use client";

import { ThemeProvider } from "./theme-provider";
import { DashboardLayout } from "./dashboard-layout";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ThemeProvider>
  );
}
