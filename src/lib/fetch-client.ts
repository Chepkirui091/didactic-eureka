import { isFallbackResponse, readApiError } from "@/lib/api-response";
import { toastDbFallbackOnce, toastError } from "@/lib/toast-messages";

export async function apiFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<{
  data: T | null;
  ok: boolean;
  source: "database" | "fallback" | null;
}> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      toastError(await readApiError(res));
      return { data: null, ok: false, source: null };
    }
    const source = isFallbackResponse(res) ? "fallback" : "database";
    if (source === "fallback") toastDbFallbackOnce();
    const data = (await res.json()) as T;
    return { data, ok: true, source };
  } catch {
    toastError("Network error — could not reach the server.");
    return { data: null, ok: false, source: null };
  }
}
