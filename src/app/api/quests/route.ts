import { NextResponse } from 'next/server';
import { db } from '@/db';
import { quests, completedQuests } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/auth';
import { isAdminUnlocked } from '@/lib/adminLock';

// GET /api/quests — return all active + completed quests for the current user
export async function GET() {
  const userId = getCurrentUserId();

  const [activeQuests, completed] = await Promise.all([
    db.select().from(quests).where(eq(quests.userId, userId)),
    db.select().from(completedQuests).where(eq(completedQuests.userId, userId)),
  ]);

  return NextResponse.json({
    quests: activeQuests,
    completedQuests: completed,
  });
}

// POST /api/quests — create a new quest
export async function POST(req: Request) {
  if (!(await isAdminUnlocked())) {
    return NextResponse.json(
      { error: 'Admin unlock required for quest changes.' },
      { status: 403 },
    );
  }

  const userId = getCurrentUserId();
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
      userId,
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
