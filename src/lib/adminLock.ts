import { cookies } from 'next/headers';

export const ADMIN_UNLOCK_COOKIE = 'rpg_admin_unlocked';

export async function isAdminUnlocked(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_UNLOCK_COOKIE)?.value === '1';
}
