import { NextResponse } from 'next/server';
import { db } from '@/db';
import { quests, completedQuests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentCharacterContext, isAuthError } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

// PATCH /api/quests/[id] — update streak, start, or use streak save token
export async function PATCH(req: Request, { params }: Params) {
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

  const { id } = await params;
  const body = await req.json();

  const [existing] = await db
    .select()
    .from(quests)
    .where(and(eq(quests.id, id), eq(quests.characterId, context.characterId)));

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const updates: Partial<typeof existing> = {};

  if (body.action === 'increment') {
    updates.currentStreak = Math.min(
      existing.currentStreak + 1,
      existing.goalDays,
    );
    updates.updatedAt = new Date();
  } else if (body.action === 'decrement') {
    updates.currentStreak = Math.max(existing.currentStreak - 1, 0);
    updates.updatedAt = new Date();
  } else if (body.action === 'reset') {
    updates.currentStreak = 0;
    updates.updatedAt = new Date();
  } else if (body.action === 'start') {
    updates.isStarted = true;
    updates.updatedAt = new Date();
  } else if (body.action === 'useStreakSave') {
    if (!existing.streakSaveToken) {
      return NextResponse.json(
        { error: 'Token already used' },
        { status: 400 },
      );
    }
    updates.streakSaveToken = false;
    updates.updatedAt = new Date();
  }

  const [updated] = await db
    .update(quests)
    .set(updates)
    .where(eq(quests.id, id))
    .returning();

  return NextResponse.json(updated);
}

// DELETE /api/quests/[id]?complete=true — complete (archive) or delete a quest
export async function DELETE(req: Request, { params }: Params) {
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

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const complete = searchParams.get('complete') === 'true';

  const [existing] = await db
    .select()
    .from(quests)
    .where(and(eq(quests.id, id), eq(quests.characterId, context.characterId)));

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (complete) {
    await db.insert(completedQuests).values({
      userId: context.userId,
      characterId: context.characterId,
      questGiverUserId: existing.questGiverUserId,
      questGiverName: existing.questGiverName,
      questGiverTitle: existing.questGiverTitle,
      title: existing.title,
      goalDays: existing.goalDays,
      isLegendary: existing.isLegendary,
      completedAt: new Date(),
    });
  }

  await db.delete(quests).where(eq(quests.id, id));

  return new NextResponse(null, { status: 204 });
}
