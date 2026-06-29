export const DATA_SOURCE_HEADER = "x-data-source";

export function isFallbackResponse(res: Response): boolean {
  return res.headers.get(DATA_SOURCE_HEADER) === "fallback";
}

export async function readApiError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string; message?: string };
    return body.error ?? body.message ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}
