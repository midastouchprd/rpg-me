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
- Clerk authentication

## Current State

### Completed

- [x] Project scaffolded with `create-next-app`
- [x] shadcn initialized, components installed: button, card, badge, dialog, input, label, progress, separator, scroll-area
- [x] quest card, legendary quest card, completed quest card, add-quest modal, add-legendary modal, and dashboard UI are implemented
- [x] database-backed quest API routes exist under `src/app/api/quests/**`
- [x] Drizzle schema exists in `src/db/schema.ts`
- [x] seed script exists in `scripts/seed.ts`
- [x] Clerk auth is wired into `middleware.ts`, `src/app/layout.tsx`, and `src/lib/auth.ts`
- [x] quest APIs require authenticated users
- [x] temporary admin PIN unlock gates all write actions after sign-in
- [x] character ownership foundation exists: `characters` table, default character creation, slug generation, and quest/completed quest linkage by `characterId`

### Still Needs Building

- [ ] public inspect mode for non-owners (WoW-style read-only profile)
- [ ] owner-vs-visitor authorization at the character level instead of the current single-user dashboard model
- [ ] character-specific routes and UI (`/character/[slug]`)
- [ ] replace temporary email-based local-user mapping with a more explicit Clerk identity mapping in the DB
- [ ] remove or reduce reliance on admin PIN once owner permissions are fully implemented

## Architecture Notes

### Data Flow

- UI state lives in Zustand (`useQuestStore`), but quest data is fetched and mutated through Next.js API routes
- The store handles signed-out/auth-required states and API errors
- All writes are server-enforced; button disabling is not the security boundary
- `currentStreak` is designed to be driven externally (Health Connect sync) — do not hardcode assumptions about how it gets incremented

### Auth / Access Model

- Clerk handles sign-in and session state
- `src/lib/auth.ts` resolves the current Clerk user, upserts/loads a local DB user by email, and creates/resolves the user's default character
- Current behavior is authenticated single-character dashboard access: a signed-in user sees the quests for their resolved character
- Existing user-owned quest rows are backfilled onto the default character automatically
- Write actions still require the temporary admin unlock cookie in addition to being authenticated
- The admin unlock is browser-cookie based and intentionally temporary until full ownership/inspect permissions are implemented

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

The seed script inserts sample quest data into the database. The current auth mapping is email-based, so to see seeded data immediately after signing in with Clerk, use the same email address as the seeded DB user. Do not treat this guide as the source of truth for current quest records; the database and `scripts/seed.ts` are the source of truth.

## UI Guidelines

- WoW-inspired but clean and modern
- Regular quests: blue/slate color scheme
- Legendary quests: gold (#C07000 / amber) color scheme, visually distinct
- Completed quests: green color scheme
- Locked legendary quests: grayed out with lock icon, Start Quest button to unlock
- Progress shown as both X/Y and a progress bar
- Quest giver shown as subtitle on each card

## Important Files

- `src/app/page.tsx` — signed-in dashboard, Clerk auth UI, admin unlock dialog
- `src/store/questStore.ts` — quest fetching/mutation client state
- `src/lib/auth.ts` — Clerk session to local DB user + default character resolution
- `src/app/api/quests/route.ts` — list/create quests for the resolved current character
- `src/app/api/quests/[id]/route.ts` — mutate/delete quests owned by the resolved current character
- `src/app/api/admin/unlock/route.ts` — temporary admin PIN unlock
- `src/db/schema.ts` — DB schema for users, characters, quests, completed quests
- `scripts/seed.ts` — sample data seed and character backfill
