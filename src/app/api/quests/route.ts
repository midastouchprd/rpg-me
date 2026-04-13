import { NextResponse } from 'next/server';
import { db } from '@/db';
import { quests, completedQuests } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentCharacterContext, isAuthError } from '@/lib/auth';
import { isAdminUnlocked } from '@/lib/adminLock';

// GET /api/quests — return all active + completed quests for the current user
export async function GET() {
  let context: Awaited<ReturnType<typeof getCurrentCharacterContext>>;
  try {
    context = await getCurrentCharacterContext();
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    throw error;
  }

  const [activeQuests, completed] = await Promise.all([
    db.select().from(quests).where(eq(quests.characterId, context.characterId)),
    db
      .select()
      .from(completedQuests)
      .where(eq(completedQuests.characterId, context.characterId)),
  ]);

  return NextResponse.json({
    character: {
      id: context.characterId,
      slug: context.characterSlug,
      name: context.characterName,
      isPublic: context.isPublic,
    },
    quests: activeQuests,
    completedQuests: completed,
  });
}

// POST /api/quests — create a new quest
export async function POST(req: Request) {
  let context: Awaited<ReturnType<typeof getCurrentCharacterContext>>;
  try {
    context = await getCurrentCharacterContext();
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    throw error;
  }

  if (!(await isAdminUnlocked())) {
    return NextResponse.json(
      { error: 'Admin unlock required for quest changes.' },
      { status: 403 },
    );
  }

  const body = await req.json();

  const {
    title,
    questGiverName,
    goalDays,
    isLegendary,
    requirement,
    questGiverTitle,
  } = body;

  const [created] = await db
    .insert(quests)
    .values({
      userId: context.userId,
      characterId: context.characterId,
      title,
      questGiverName,
      questGiverTitle: questGiverTitle ?? null,
      goalDays,
      currentStreak: 0,
      streakSaveToken: true,
      isLegendary: isLegendary ?? false,
      isStarted: isLegendary ? false : true,
      requirement: requirement ?? null,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
