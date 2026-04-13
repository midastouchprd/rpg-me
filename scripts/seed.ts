// Seed script — syncs Tosin's current quest snapshot into the DB.
// Run once after `npm run db:push`:
//   npm run db:seed
//
// It is idempotent for user/character creation and replaces the seeded
// character's quest state on each run.

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function getUniqueSlug(base: string) {
  const baseSlug = slugify(base) || 'character';
  let candidate = baseSlug;
  let suffix = 2;
  while (true) {
    const [existing] = await db
      .select({ id: schema.characters.id })
      .from(schema.characters)
      .where(eq(schema.characters.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
    candidate = `${baseSlug}-${suffix++}`;
  }
}

async function seed() {
  const EMAIL = process.env.SEED_EMAIL ?? 'tosin@rpg-me.app';
  if (!process.env.SEED_EMAIL) {
    console.warn('SEED_EMAIL not set — defaulting to tosin@rpg-me.app');
  }
  console.log(`Seeding for: ${EMAIL}`);

  // -------------------------------------------------------------------------
  // Upsert player user
  // -------------------------------------------------------------------------
  let user = (
    await db.select().from(schema.users).where(eq(schema.users.email, EMAIL))
  )[0];

  const displayName = process.env.SEED_DISPLAY_NAME ?? EMAIL.split('@')[0];

  if (!user) {
    [user] = await db
      .insert(schema.users)
      .values({
        email: EMAIL,
        displayName,
        role: 'player',
      })
      .returning();
    console.log('Created user:', user.id);
  } else {
    console.log('User already exists:', user.id);
  }

  let character = (
    await db
      .select()
      .from(schema.characters)
      .where(eq(schema.characters.ownerUserId, user.id))
  )[0];

  if (!character) {
    const slug = await getUniqueSlug(displayName);
    [character] = await db
      .insert(schema.characters)
      .values({
        ownerUserId: user.id,
        slug,
        name: displayName,
        isPublic: false,
      })
      .returning();
    console.log('Created character:', character.id, '/ slug:', character.slug);
  } else {
    console.log('Character already exists:', character.id, '/ slug:', character.slug);
  }

  await db
    .update(schema.quests)
    .set({ characterId: character.id })
    .where(
      and(eq(schema.quests.userId, user.id), isNull(schema.quests.characterId)),
    );

  await db
    .update(schema.completedQuests)
    .set({ characterId: character.id })
    .where(
      and(
        eq(schema.completedQuests.userId, user.id),
        isNull(schema.completedQuests.characterId),
      ),
    );

  // -------------------------------------------------------------------------
  // Active quests — synced from live app Apr 13 2026
  // -------------------------------------------------------------------------
  const activeQuests = [
    {
      title: 'Fast for 16 Hrs',
      questGiverName: 'Deanna',
      goalDays: 7,
      currentStreak: 0,
      isLegendary: false,
      isStarted: true,
      streakSaveToken: true,
    },
    {
      title: 'Track All Your Food',
      questGiverName: 'Sasha',
      goalDays: 7,
      currentStreak: 0,
      isLegendary: false,
      isStarted: true,
      streakSaveToken: true,
    },
    {
      title: 'Take a shower and brush teeth X days in a row',
      questGiverName: 'Chelsea',
      goalDays: 20,
      currentStreak: 19,
      isLegendary: false,
      isStarted: true,
      streakSaveToken: true,
    },
    {
      title: 'Walk 4000 Steps',
      questGiverName: 'Emily',
      goalDays: 20,
      currentStreak: 14,
      isLegendary: false,
      isStarted: true,
      streakSaveToken: true,
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
      streakSaveToken: true,
    },
  ];

  // -------------------------------------------------------------------------
  // Completed quests — synced from live app Apr 13 2026
  // -------------------------------------------------------------------------
  const completed = [
    {
      title: 'Take a shower 10 days in a row',
      questGiverName: 'Chelsea',
      goalDays: 10,
      isLegendary: false,
      completedAt: new Date('2026-03-22'),
    },
    {
      title: 'Fast for 16 hours X days in a row',
      questGiverName: 'Hannah',
      goalDays: 3,
      isLegendary: false,
      completedAt: new Date('2026-03-22'),
    },
    {
      title: 'Walk 3,500 steps X days in a row',
      questGiverName: 'Emily',
      goalDays: 7,
      isLegendary: false,
      completedAt: new Date('2026-03-27'),
    },
    {
      title: 'Sleep 6+ hours a night X nights in a row',
      questGiverName: 'Cyn',
      goalDays: 7,
      isLegendary: false,
      completedAt: new Date('2026-03-28'),
    },
    {
      title: 'Stretch in the morning',
      questGiverName: 'Cyn',
      goalDays: 14,
      isLegendary: false,
      completedAt: new Date('2026-04-12'),
    },
    {
      title: '80oz of Water A Day',
      questGiverName: 'Breanna',
      questGiverTitle: 'Juiceland Smoothies',
      goalDays: 7,
      isLegendary: false,
      completedAt: new Date('2026-04-12'),
    },
  ];

  await db
    .delete(schema.quests)
    .where(eq(schema.quests.characterId, character.id));
  await db.insert(schema.quests).values(
    [...activeQuests, ...legendaryQuests].map((q) => ({
      userId: user.id,
      characterId: character.id,
      streakSaveToken: true,
      ...q,
    })),
  );
  console.log(
    `Synced ${activeQuests.length + legendaryQuests.length} active/legendary quests`,
  );

  await db
    .delete(schema.completedQuests)
    .where(eq(schema.completedQuests.characterId, character.id));
  await db.insert(schema.completedQuests).values(
    completed.map((q) => ({
      userId: user.id,
      characterId: character.id,
      ...q,
    })),
  );
  console.log(`Synced ${completed.length} completed quests`);

  console.log('\n✅ Seed complete!');
  console.log(`User ID: ${user.id}`);
  console.log(`Character ID: ${character.id}`);
  console.log(`Character slug: ${character.slug}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
