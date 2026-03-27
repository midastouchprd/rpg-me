// Seed script — inserts Tosin's current quest data into the DB.
// Run once after `npm run db:push`:
//   npm run db:seed
//
// It is idempotent: checks for an existing user by email before inserting.
// After running, copy the printed SEED_USER_ID into your .env.local.

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  const EMAIL = 'tosin@rpg-me.app';

  // -------------------------------------------------------------------------
  // Upsert player user
  // -------------------------------------------------------------------------
  let user = (
    await db.select().from(schema.users).where(eq(schema.users.email, EMAIL))
  )[0];

  if (!user) {
    [user] = await db
      .insert(schema.users)
      .values({
        email: EMAIL,
        username: 'tosin',
        displayName: 'Tosin',
        role: 'player',
      })
      .returning();
    console.log('Created user:', user.id);
  } else {
    console.log('User already exists:', user.id);
  }

  // -------------------------------------------------------------------------
  // Active quests — using streak counts from screenshot (4/20, 5/7, 5/7)
  // -------------------------------------------------------------------------
  const activeQuests = [
    {
      title: 'Take a shower AND brush teeth X days in a row',
      questGiverName: 'Chelsea',
      goalDays: 20,
      currentStreak: 4,
      isLegendary: false,
      isStarted: true,
    },
    {
      title: 'Walk 3,500 steps X days in a row',
      questGiverName: 'Emily',
      goalDays: 7,
      currentStreak: 5,
      isLegendary: false,
      isStarted: true,
    },
    {
      title: 'Sleep 6+ hours a night X nights in a row',
      questGiverName: 'Cyn',
      goalDays: 7,
      currentStreak: 5,
      isLegendary: false,
      isStarted: true,
    },
  ];

  // -------------------------------------------------------------------------
  // Legendary quests
  // -------------------------------------------------------------------------
  const legendaryQuests = [
    {
      title: 'Stay under 400lbs for 7 consecutive days',
      questGiverName: 'Kacey Samiee',
      questGiverTitle: 'Legendary Quest Giver',
      goalDays: 7,
      currentStreak: 0,
      isLegendary: true,
      isStarted: false,
      requirement: 'Reach 399lbs to begin this quest',
    },
  ];

  // -------------------------------------------------------------------------
  // Completed quests
  // -------------------------------------------------------------------------
  const completed = [
    {
      title: 'Take a shower 10 days in a row',
      questGiverName: 'Chelsea',
      goalDays: 10,
      isLegendary: false,
      completedAt: new Date('2026-03-24'),
    },
    {
      title: 'Fast for 16 hours X days in a row',
      questGiverName: 'Hannah',
      goalDays: 3,
      isLegendary: false,
      completedAt: new Date('2026-03-24'),
    },
  ];

  // Only insert active/legendary if the user has none yet
  const existingActive = await db
    .select()
    .from(schema.quests)
    .where(eq(schema.quests.userId, user.id));

  if (existingActive.length === 0) {
    await db.insert(schema.quests).values(
      [...activeQuests, ...legendaryQuests].map((q) => ({
        userId: user.id,
        streakSaveToken: true,
        ...q,
      })),
    );
    console.log(
      `Inserted ${activeQuests.length + legendaryQuests.length} quests`,
    );
  } else {
    console.log('Quests already seeded, skipping');
  }

  const existingCompleted = await db
    .select()
    .from(schema.completedQuests)
    .where(eq(schema.completedQuests.userId, user.id));

  if (existingCompleted.length === 0) {
    await db
      .insert(schema.completedQuests)
      .values(completed.map((q) => ({ userId: user.id, ...q })));
    console.log(`Inserted ${completed.length} completed quests`);
  } else {
    console.log('Completed quests already seeded, skipping');
  }

  console.log('\n✅ Seed complete!');
  console.log(`\nAdd this to your .env.local:\nSEED_USER_ID=${user.id}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
