# RPG-Me — Agent Guide

## Project Overview

RPG-Me is a self-care quest tracker built as a personal RPG. The user treats themselves as an RPG character (World of Warcraft-brained). Quests are real-life self-care goals given by friends/doctors/etc.

## Stack

- Next.js 16 (App Router, src/ dir)
- TypeScript
- Tailwind CSS
- shadcn/ui (components in src/components/ui/)
- Zustand client store backed by API routes
- Drizzle ORM + Neon Postgres
- Clerk authentication (v7)

## Current State

### Completed

- [x] Project scaffolded with `create-next-app`
- [x] shadcn initialized, components installed: button, card, badge, dialog, input, label, progress, separator, scroll-area
- [x] quest card, legendary quest card, completed quest card, add-quest modal, add-legendary modal, and dashboard UI are implemented
- [x] database-backed quest API routes exist under `src/app/api/quests/**`
- [x] Drizzle schema exists in `src/db/schema.ts`
- [x] seed script exists in `scripts/seed.ts`
- [x] Clerk auth is wired into `src/middleware.ts`, `src/app/layout.tsx`, and `src/lib/auth.ts`
- [x] quest APIs require authenticated users
- [x] character ownership foundation exists: `characters` table, default character creation, slug generation, and quest/completed quest linkage by `characterId`
- [x] public inspect mode for non-owners — `/character/[slug]` shows read-only view for visitors
- [x] owner-vs-visitor authorization at the character level — ownership enforced server-side via character context; no admin PIN
- [x] character-specific routes and UI (`/character/[slug]`) — home page redirects signed-in users to their character page
- [x] admin PIN system removed — write access gated by character ownership alone

### Still Needs Building

- [ ] replace email-based local-user mapping with explicit Clerk `externalId` mapping in the DB
- [ ] multiple characters per user
- [ ] character `isPublic` toggle in the UI (currently set directly in DB; default is `false`)
- [ ] Health Connect sync (`/api/health-connect`) for auto-incrementing streaks from Android step/sleep/weight data

## Architecture Notes

### Data Flow

- UI state lives in Zustand (`useQuestStore`), but quest data is fetched and mutated through Next.js API routes
- The store handles signed-out/auth-required states and API errors
- All writes are server-enforced; button disabling is not the security boundary
- `currentStreak` is designed to be driven externally (Health Connect sync) — do not hardcode assumptions about how it gets incremented

### Auth / Access Model

- Clerk handles sign-in and session state
- `src/lib/auth.ts` provides two auth helpers:
  - `getCurrentCharacterContext()` — resolves the signed-in Clerk user → local DB user (upsert by email) → default character (create if missing). Used by all write API routes.
  - `getOptionalLocalUserId()` — lightweight read-only lookup: Clerk user → local DB user ID, no row creation. Used by the public character API to determine `isOwner` without side effects.
- `src/middleware.ts` must live in `src/` (not root) because the project uses a `src/` directory — Clerk v7 enforces this.
- Write authorization: a mutation is allowed if and only if the quest's `characterId` matches the signed-in user's resolved character. No additional layer needed.
- Character visibility: `characters.isPublic` gates `/api/character/[slug]` for non-owners. Owners always have access. Default is `false` — set to `true` in the DB to make a character publicly viewable.

### Routing

- `/` — landing page for signed-out users; redirects signed-in users to `/character/[slug]`
- `/character/[slug]` — main character page. Owner mode: full interactive controls via Zustand store. Visitor mode: read-only, data from `/api/character/[slug]`.

### Health Connect (Future)

- Android Health Connect → Google Fit REST API → Next.js API route (`/api/health-connect`)
- Will auto-increment quest progress based on steps, sleep, weight data
- Keep `currentStreak` updatable from both UI buttons AND external API calls

### Quest Types

- **Quest**: Regular self-care goal (shower, steps, sleep, fasting)
- **LegendaryQuest**: Big milestone, can be locked behind a requirement, golden UI treatment
- **CompletedQuest**: Archived quest with completion timestamp, flagged as legendary or not

## Zustand Store Actions

| Action                       | Description                      |
| ---------------------------- | -------------------------------- |
| `addQuest`                   | Add new regular quest            |
| `addLegendaryQuest`          | Add new legendary quest          |
| `incrementQuest(id)`         | +1 streak, capped at goalDays    |
| `decrementQuest(id)`         | -1 streak, floored at 0          |
| `resetQuest(id)`             | Reset streak to 0                |
| `incrementLegendary(id)`     | Same as above for legendary      |
| `decrementLegendary(id)`     | Same                             |
| `resetLegendary(id)`         | Same                             |
| `startLegendaryQuest(id)`    | Unlock a locked legendary quest  |
| `completeQuest(id)`          | Move quest → completedQuests     |
| `completeLegendaryQuest(id)` | Move legendary → completedQuests |

## Seeded Data

Run `SEED_EMAIL=you@example.com npm run db:seed` to seed quest data for a given account. The script finds or creates the local user by email and generates a unique character slug from the email prefix. Pass `SEED_DISPLAY_NAME=YourName` to override the display name. The database and `scripts/seed.ts` are the source of truth for current quest records, not this guide.

## UI Guidelines

- WoW-inspired but clean and modern
- Regular quests: blue/slate color scheme
- Legendary quests: gold (#C07000 / amber) color scheme, visually distinct
- Completed quests: green color scheme
- Locked legendary quests: grayed out with lock icon, Start Quest button to unlock
- Progress shown as both X/Y and a progress bar
- Quest giver shown as subtitle on each card

## Important Files

- `src/app/page.tsx` — landing/redirect page; signed-in users are sent to their character slug
- `src/app/character/[slug]/page.tsx` — main character UI; owner gets full controls, visitor gets read-only
- `src/store/questStore.ts` — quest fetching/mutation client state
- `src/lib/auth.ts` — Clerk session to local DB user + default character resolution; `getOptionalLocalUserId` for read-only ownership checks
- `src/app/api/quests/route.ts` — list/create quests for the resolved current character
- `src/app/api/quests/[id]/route.ts` — mutate/delete quests owned by the resolved current character
- `src/app/api/character/[slug]/route.ts` — public character profile API; returns quests + `isOwner` flag
- `src/db/schema.ts` — DB schema for users, characters, quests, completed quests
- `scripts/seed.ts` — sample data seed; accepts `SEED_EMAIL` and `SEED_DISPLAY_NAME` env vars
- `src/middleware.ts` — Clerk middleware (must be in `src/`, not root)
