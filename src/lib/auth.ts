// Temporary auth stub — returns the single seed user's ID.
// Replace this with your real session lookup when auth is added
// (e.g. `await auth()` from Clerk, or `getServerSession()` from NextAuth).
//
// SEED_USER_ID must match the id inserted by `npm run db:seed`.

export function getCurrentUserId(): string {
  const id = process.env.SEED_USER_ID;
  if (!id) {
    throw new Error(
      'SEED_USER_ID env var is not set. Run `npm run db:seed` first.',
    );
  }
  return id;
}
