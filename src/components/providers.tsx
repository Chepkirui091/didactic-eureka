"use client";

import { ThemeProvider } from "./theme-provider";
import { DashboardLayout } from "./dashboard-layout";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardLayout>{children}</DashboardLayout>
      <Toaster richColors closeButton position="top-center" />
    </ThemeProvider>
  );
}
