// Motivational quotes — one per day (deterministic to avoid hydration mismatch)

export const MOTIVATIONAL_QUOTES = [
  "Small habits lead to big changes.",
  "You don't have to be great to start, but you have to start to be great.",
  "Consistency is more important than perfection.",
  "The secret of getting ahead is getting started.",
  "Progress, not perfection.",
  "One day at a time.",
  "Your future is created by what you do today.",
  "It's not about being the best. It's about being better than you were yesterday.",
  "Habits are the compound interest of self-improvement.",
  "Start where you are. Use what you have. Do what you can.",
  "Every small step counts.",
  "Trust the process.",
  "Be kind to yourself when you miss a day. Just begin again.",
  "The only bad workout is the one that didn't happen.",
  "You are one habit away from a different life.",
];

/** Returns the same quote for the same date (SSR-safe, no hydration mismatch). */
export function getQuoteForDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const start = new Date(y, 0, 0);
  const day = new Date(y, m - 1, d);
  const dayOfYear = Math.floor((day.getTime() - start.getTime()) / 86400000);
  const index = dayOfYear % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index] ?? MOTIVATIONAL_QUOTES[0];
}
