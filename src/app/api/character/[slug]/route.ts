import { NextResponse } from 'next/server';
import { db } from '@/db';
import { characters, quests, completedQuests } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getOptionalLocalUserId } from '@/lib/auth';

type Params = { params: Promise<{ slug: string }> };

// GET /api/character/[slug] — public character profile with quests
export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;

  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.slug, slug))
    .limit(1);

  if (!character) {
    return NextResponse.json({ error: 'Character not found' }, { status: 404 });
  }

  const localUserId = await getOptionalLocalUserId();
  const isOwner = localUserId !== null && localUserId === character.ownerUserId;

  if (!character.isPublic && !isOwner) {
    return NextResponse.json({ error: 'This character is private.' }, { status: 403 });
  }

  const [activeQuests, completed] = await Promise.all([
    db.select().from(quests).where(eq(quests.characterId, character.id)),
    db
      .select()
      .from(completedQuests)
      .where(eq(completedQuests.characterId, character.id)),
  ]);

  return NextResponse.json({
    character: {
      id: character.id,
      slug: character.slug,
      name: character.name,
      isPublic: character.isPublic,
    },
    quests: activeQuests,
    completedQuests: completed,
    isOwner,
  });
}
