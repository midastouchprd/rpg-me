# RPG-Me

RPG-Me is a self-care quest tracker built like a personal RPG. Quests are real-life goals, legendary quests are larger milestones, and the long-term product direction includes public read-only character inspection similar to WoW.

## Current State

- Next.js App Router app with TypeScript and Tailwind
- UI built with shadcn/ui components
- Data stored in Neon Postgres via Drizzle ORM
- Clerk authentication is integrated
- A `characters` model now exists and each signed-in user resolves to a default character
- Quest reads require sign-in and load data for the resolved current character
- Quest writes require sign-in plus the temporary admin PIN unlock
- Next major milestone is public inspect mode plus owner-vs-visitor authorization by character

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.local.example` and fill in:

```dotenv
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ADMIN_PIN_CODE=
```

3. Push the schema:

```bash
npm run db:push
```

4. Seed sample data:

```bash
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Auth Notes

- Clerk provides sign-in/session state.
- The app currently maps the signed-in Clerk account to a local DB user by email.
- If you want to see seeded data immediately, sign in with the same email address used by the seeded DB user.
- Sample quest records live in the database seed script, not in this README.
- This email-based mapping is acceptable short-term but should be replaced with a dedicated Clerk identity mapping in the database.

## Admin Unlock

- The admin unlock is a temporary pre-ownership safeguard for public deployment.
- It is cookie-based and works per browser profile.
- It is not a replacement for character ownership or authorization.
- The intended future state is owner-only writes with public inspect-mode reads.

## Scripts

```bash
npm run dev
npm run lint
npm run db:push
npm run db:studio
npm run db:seed
```

## Important Files

- `src/app/page.tsx`: signed-in dashboard and admin unlock UI
- `src/store/questStore.ts`: client quest loading and mutation state
- `src/lib/auth.ts`: Clerk session to DB user resolution
- `src/app/api/quests/route.ts`: list/create quests
- `src/app/api/quests/[id]/route.ts`: update/delete quests
- `src/app/api/admin/unlock/route.ts`: temporary admin unlock endpoint
- `src/db/schema.ts`: Drizzle schema
- `scripts/seed.ts`: seed data script

## Next Step

Build `/character/[slug]` and the inspect-mode permission model so owners can manage their own character while visitors get a read-only public profile.
