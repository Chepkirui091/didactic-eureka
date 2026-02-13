# Habit Flow

A habit tracking system that helps you build consistency, understand patterns, and stay motivated—with a compassionate, non-guilt UX (complete / skip / miss).

## Features

- **Dashboard** — Today’s habits, daily goal progress, streaks, quick links.
- **Habits** — List and detail views; binary, quantitative, and timed habits; categories and scheduling (daily, weekly, custom).
- **Progress** — Streaks (current/longest), completion rate, GitHub-style activity heatmap.
- **Analytics** — Completion by habit, weekly patterns, insights (e.g. most skipped habits).
- **Reminders** — Placeholder UI for time-based and end-of-day reminders.
- **Achievements** — Badges and milestones (e.g. 7-day streak, 30-day reader).
- **Settings** — Light/dark/system theme and accent color.

The app runs with **dummy data** by default (no database required). Data layer: `src/lib/dummy-data.ts` and `src/lib/api-store.ts`. API routes under `/api/habits` use the in-memory store; connect Prisma and run migrations when you want a real DB.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
