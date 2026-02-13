/**
 * Seed script for habit tracker.
 * Run with: npx prisma db seed (after setting up DATABASE_URL and running migrations)
 *
 * This file is a placeholder. When using the full schema with User/Habit/HabitEntry,
 * you would create a demo user and habits here. The app currently uses dummy data
 * from src/lib/dummy-data.ts for development without a database.
 */

export async function main() {
  console.log("Seed placeholder. Use src/lib/dummy-data.ts for development.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
