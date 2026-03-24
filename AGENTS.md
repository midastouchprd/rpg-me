# RPG-Me — Agent Guide

## Project Overview

RPG-Me is a self-care quest tracker built as a personal RPG. The user treats themselves as an RPG character (World of Warcraft-brained). Quests are real-life self-care goals given by friends/doctors/etc.

## Stack

- Next.js 15 (App Router, src/ dir)
- TypeScript
- Tailwind CSS
- shadcn/ui (components in src/components/ui/)
- Zustand with persist middleware (localStorage)
- uuid for ID generation

## Current State

### Completed

- [x] Project scaffolded with `create-next-app`
- [x] shadcn initialized, components installed: button, card, badge, dialog, input, label, progress, separator, scroll-area
- [x] zustand + uuid installed
- [x] `src/types/quest.ts` — Quest, LegendaryQuest, CompletedQuest types
- [x] `src/store/questStore.ts` — full Zustand store with persist

### Still Needs Building

- [ ] `src/components/QuestCard.tsx` — active quest card with +/−/reset buttons, auto-completes when streak hits goal
- [ ] `src/components/LegendaryQuestCard.tsx` — locked until started, golden styling, Start Quest button
- [ ] `src/components/CompletedQuestCard.tsx` — completed quest display with date
- [ ] `src/components/AddQuestModal.tsx` — dialog form: title, quest giver, goal days
- [ ] `src/components/AddLegendaryQuestModal.tsx` — dialog form: title, quest giver, goal days, requirement (optional)
- [ ] `src/app/page.tsx` — main dashboard layout

## Architecture Notes

### Data Flow

- All state lives in Zustand store (`useQuestStore`)
- Persisted to localStorage under key `rpg-me-quests`
- `currentStreak` is designed to be driven externally (Health Connect sync) — do not hardcode assumptions about how it gets incremented

### Health Connect (Future)

- Android Health Connect → Google Fit REST API → Next.js API route (`/api/health-connect`)
- Will auto-increment quest progress based on steps, sleep, weight data
- Plan to add Supabase or Planetscale as DB when Health Connect sync is built
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

## Default Data (already seeded in store)

### Active Quests

- "Take a shower AND brush teeth X days in a row" — Chelsea — 20 days (streak: 1)
- "Walk 3,500 steps X days in a row" — Emily — 7 days (streak: 2)
- "Sleep 6+ hours a night X nights in a row" — Cyn — 7 days (streak: 3)

### Legendary Quests

- "Stay under 400lbs for 7 consecutive days" — Kacey Samiee — locked, requirement: "Reach 399lbs to begin this quest"

### Completed Quests

- "Take a shower 10 days in a row" — Chelsea — 10 days
- "Fast for 16 hours X days in a row" — Hannah — 3 days

## UI Guidelines

- WoW-inspired but clean and modern
- Regular quests: blue/slate color scheme
- Legendary quests: gold (#C07000 / amber) color scheme, visually distinct
- Completed quests: green color scheme
- Locked legendary quests: grayed out with lock icon, Start Quest button to unlock
- Progress shown as both X/Y and a progress bar
- Quest giver shown as subtitle on each card
