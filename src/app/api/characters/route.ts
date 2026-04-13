import { NextResponse } from 'next/server';
import { eq, count } from 'drizzle-orm';
import { db } from '@/db';
import { characters, quests, completedQuests } from '@/db/schema';

// GET /api/characters — list all public characters with quest counts
export async function GET() {
  const publicCharacters = await db
    .select({ id: characters.id, slug: characters.slug, name: characters.name })
    .from(characters)
    .where(eq(characters.isPublic, true));

  if (publicCharacters.length === 0) {
    return NextResponse.json([]);
  }

  const [activeCountRows, completedCountRows] = await Promise.all([
    db
      .select({ characterId: quests.characterId, count: count() })
      .from(quests)
      .groupBy(quests.characterId),
    db
      .select({ characterId: completedQuests.characterId, count: count() })
      .from(completedQuests)
      .groupBy(completedQuests.characterId),
  ]);

  const activeCounts = new Map(
    activeCountRows.map((r) => [r.characterId, r.count]),
  );
  const completedCounts = new Map(
    completedCountRows.map((r) => [r.characterId, r.count]),
  );

  const result = publicCharacters.map((c) => ({
    slug: c.slug,
    name: c.name,
    activeQuests: activeCounts.get(c.id) ?? 0,
    completedQuests: completedCounts.get(c.id) ?? 0,
  }));

  return NextResponse.json(result);
}
