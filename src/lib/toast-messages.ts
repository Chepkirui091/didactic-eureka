import { toast } from "sonner";

export const toastSuccess = (message: string) => toast.success(message);
export const toastError = (message: string) => toast.error(message);
export const toastInfo = (message: string) => toast.info(message);
export const toastWarning = (message: string) => toast.warning(message);

export function toastDbFallbackOnce(): void {
  toast.warning(
    "Database unreachable — saved offline. Check DATABASE_URL in .env.local (Render Postgres URL), then restart npm run dev.",
    { id: "db-fallback", duration: 8000 },
  );
}

export function toastSavedToDb(label = "Saved to database"): void {
  toast.success(label, { id: "db-saved", duration: 2500 });
}
