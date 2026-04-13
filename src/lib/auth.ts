import { auth, currentUser } from '@clerk/nextjs/server';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { characters, completedQuests, quests, users } from '@/db/schema';

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

function getDisplayName(email: string, fullName: string | null) {
  if (fullName && fullName.trim()) {
    return fullName.trim();
  }
  return email.split('@')[0] || 'Player';
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function getUniqueCharacterSlug(baseValue: string) {
  const baseSlug = slugify(baseValue) || 'character';
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const [existing] = await db
      .select({ id: characters.id })
      .from(characters)
      .where(eq(characters.slug, candidate))
      .limit(1);

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function backfillCharacterOwnership(userId: string, characterId: string) {
  await Promise.all([
    db
      .update(quests)
      .set({ characterId })
      .where(and(eq(quests.userId, userId), isNull(quests.characterId))),
    db
      .update(completedQuests)
      .set({ characterId })
      .where(
        and(
          eq(completedQuests.userId, userId),
          isNull(completedQuests.characterId),
        ),
      ),
  ]);
}

export type CurrentCharacterContext = {
  userId: string;
  characterId: string;
  characterSlug: string;
  characterName: string;
  isPublic: boolean;
};

async function getOrCreateDefaultCharacter(
  userId: string,
  preferredName: string,
) {
  const [existing] = await db
    .select({
      id: characters.id,
      slug: characters.slug,
      name: characters.name,
      isPublic: characters.isPublic,
    })
    .from(characters)
    .where(eq(characters.ownerUserId, userId))
    .limit(1);

  if (existing) {
    await backfillCharacterOwnership(userId, existing.id);
    return existing;
  }

  const slug = await getUniqueCharacterSlug(preferredName);
  const [created] = await db
    .insert(characters)
    .values({
      ownerUserId: userId,
      slug,
      name: preferredName,
      isPublic: true,
    })
    .returning({
      id: characters.id,
      slug: characters.slug,
      name: characters.name,
      isPublic: characters.isPublic,
    });

  if (!created) {
    throw new AuthError('Could not create default character.', 500);
  }

  await backfillCharacterOwnership(userId, created.id);
  return created;
}

async function getOrCreateLocalUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new AuthError('Authentication required.');
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new AuthError('Could not load authenticated user profile.');
  }

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    throw new AuthError('Authenticated account is missing an email address.');
  }

  const displayName = getDisplayName(primaryEmail, clerkUser.fullName);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, primaryEmail))
    .limit(1);

  if (existing) {
    return { userId: existing.id, displayName, email: primaryEmail };
  }

  const [created] = await db
    .insert(users)
    .values({
      email: primaryEmail,
      displayName,
      role: 'player',
    })
    .returning({ id: users.id });

  if (!created) {
    throw new AuthError('Could not create local user profile.', 500);
  }

  return { userId: created.id, displayName, email: primaryEmail };
}

export async function getCurrentCharacterContext(): Promise<CurrentCharacterContext> {
  const localUser = await getOrCreateLocalUser();
  const character = await getOrCreateDefaultCharacter(
    localUser.userId,
    localUser.displayName,
  );

  return {
    userId: localUser.userId,
    characterId: character.id,
    characterSlug: character.slug,
    characterName: character.name,
    isPublic: character.isPublic,
  };
}

export async function getCurrentUserId(): Promise<string> {
  const context = await getCurrentCharacterContext();
  return context.userId;
}

// Lightweight read-only lookup — no user/character creation.
// Returns the local DB user ID for the signed-in Clerk user, or null.
export async function getOptionalLocalUserId(): Promise<string | null> {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return null;

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const primaryEmail =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) return null;

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, primaryEmail))
      .limit(1);

    return existing?.id ?? null;
  } catch {
    return null;
  }
}
