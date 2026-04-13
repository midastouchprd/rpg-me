import { NextResponse } from 'next/server';
import { ADMIN_UNLOCK_COOKIE, isAdminUnlocked } from '@/lib/adminLock';
import { getCurrentUserId, isAuthError } from '@/lib/auth';

type UnlockBody = {
  pin?: string;
};

export async function GET() {
  const unlocked = await isAdminUnlocked();
  return NextResponse.json({ unlocked });
}

export async function POST(req: Request) {
  try {
    await getCurrentUserId();
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    throw error;
  }

  const { pin } = (await req.json()) as UnlockBody;
  const expectedPin = process.env.ADMIN_PIN_CODE;

  if (!expectedPin) {
    return NextResponse.json(
      { error: 'ADMIN_PIN_CODE is not configured on the server.' },
      { status: 500 },
    );
  }

  if (!pin || pin !== expectedPin) {
    return NextResponse.json({ error: 'Invalid PIN code.' }, { status: 401 });
  }

  const response = NextResponse.json({ unlocked: true });
  response.cookies.set({
    name: ADMIN_UNLOCK_COOKIE,
    value: '1',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  return response;
}
