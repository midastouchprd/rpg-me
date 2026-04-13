'use client';

import { create } from 'zustand';
import {
  CharacterProfile,
  Quest,
  LegendaryQuest,
  CompletedQuest,
} from '@/types/quest';

// ---------------------------------------------------------------------------
// DB row → TS type coercions
// The API returns snake_case column names via Drizzle's .returning().
// We map them to the camelCase types the UI already knows.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toQuest(row: any): Quest {
  return {
    id: row.id,
    title: row.title,
    questGiver: row.quest_giver_name ?? row.questGiverName,
    goalDays: row.goal_days ?? row.goalDays,
    currentStreak: row.current_streak ?? row.currentStreak,
    isComplete: false,
    streakSaveToken: row.streak_save_token ?? row.streakSaveToken,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toLegendary(row: any): LegendaryQuest {
  return {
    id: row.id,
    title: row.title,
    questGiver: row.quest_giver_name ?? row.questGiverName,
    questGiverTitle: row.quest_giver_title ?? row.questGiverTitle ?? undefined,
    goalDays: row.goal_days ?? row.goalDays,
    currentStreak: row.current_streak ?? row.currentStreak,
    requirement: row.requirement ?? undefined,
    isStarted: row.is_started ?? row.isStarted,
    isComplete: false,
    streakSaveToken: row.streak_save_token ?? row.streakSaveToken,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCompleted(row: any): CompletedQuest {
  return {
    id: row.id,
    title: row.title,
    questGiver: row.quest_giver_name ?? row.questGiverName,
    goalDays: row.goal_days ?? row.goalDays,
    completedAt: row.completed_at ?? row.completedAt,
    isLegendary: row.is_legendary ?? row.isLegendary,
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

type QuestStore = {
  currentCharacter: CharacterProfile | null;
  quests: Quest[];
  legendaryQuests: LegendaryQuest[];
  completedQuests: CompletedQuest[];
  loading: boolean;
  authRequired: boolean;
  errorMessage: string | null;

  hydrate: () => Promise<void>;
  addQuest: (
    title: string,
    questGiver: string,
    goalDays: number,
  ) => Promise<void>;
  addLegendaryQuest: (
    title: string,
    questGiver: string,
    goalDays: number,
    requirement?: string,
  ) => Promise<void>;
  incrementQuest: (id: string) => Promise<void>;
  decrementQuest: (id: string) => Promise<void>;
  resetQuest: (id: string) => Promise<void>;
  incrementLegendary: (id: string) => Promise<void>;
  decrementLegendary: (id: string) => Promise<void>;
  resetLegendary: (id: string) => Promise<void>;
  startLegendaryQuest: (id: string) => Promise<void>;
  completeQuest: (id: string) => Promise<void>;
  completeLegendaryQuest: (id: string) => Promise<void>;
  useStreakSave: (id: string) => Promise<void>;
  useStreakSaveLegendary: (id: string) => Promise<void>;
};

async function patchQuest(id: string, action: string) {
  const res = await fetch(`/api/quests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? 'Quest update failed.');
  }
  return res.json();
}

async function deleteQuest(id: string, complete: boolean) {
  const res = await fetch(`/api/quests/${id}?complete=${complete}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? 'Quest delete failed.');
  }
}

export const useQuestStore = create<QuestStore>()((set, get) => ({
  currentCharacter: null,
  quests: [],
  legendaryQuests: [],
  completedQuests: [],
  loading: false,
  authRequired: false,
  errorMessage: null,

  hydrate: async () => {
    set({ loading: true, errorMessage: null });
    const res = await fetch('/api/quests');

    if (res.status === 401) {
      set({
        currentCharacter: null,
        quests: [],
        legendaryQuests: [],
        completedQuests: [],
        loading: false,
        authRequired: true,
      });
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      set({
        loading: false,
        errorMessage: data?.error ?? 'Failed to load quests.',
      });
      return;
    }

    const data = await res.json();

    const regular: Quest[] = [];
    const legendary: LegendaryQuest[] = [];

    for (const row of data.quests) {
      if (row.is_legendary || row.isLegendary) {
        legendary.push(toLegendary(row));
      } else {
        regular.push(toQuest(row));
      }
    }

    set({
      currentCharacter: data.character ?? null,
      quests: regular,
      legendaryQuests: legendary,
      completedQuests: (data.completedQuests ?? []).map(toCompleted),
      loading: false,
      authRequired: false,
    });
  },

  addQuest: async (title, questGiver, goalDays) => {
    const res = await fetch('/api/quests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, questGiverName: questGiver, goalDays }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? 'Failed to create quest.');
    }

    const row = await res.json();
    set((s) => ({ quests: [...s.quests, toQuest(row)] }));
  },

  addLegendaryQuest: async (title, questGiver, goalDays, requirement) => {
    const res = await fetch('/api/quests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        questGiverName: questGiver,
        goalDays,
        isLegendary: true,
        requirement,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? 'Failed to create legendary quest.');
    }

    const row = await res.json();
    set((s) => ({ legendaryQuests: [...s.legendaryQuests, toLegendary(row)] }));
  },

  incrementQuest: async (id) => {
    const row = await patchQuest(id, 'increment');
    set((s) => ({
      quests: s.quests.map((q) => (q.id === id ? toQuest(row) : q)),
    }));
  },

  decrementQuest: async (id) => {
    const row = await patchQuest(id, 'decrement');
    set((s) => ({
      quests: s.quests.map((q) => (q.id === id ? toQuest(row) : q)),
    }));
  },

  resetQuest: async (id) => {
    const row = await patchQuest(id, 'reset');
    set((s) => ({
      quests: s.quests.map((q) => (q.id === id ? toQuest(row) : q)),
    }));
  },

  completeQuest: async (id) => {
    await deleteQuest(id, true);
    await get().hydrate();
  },

  useStreakSave: async (id) => {
    const row = await patchQuest(id, 'useStreakSave');
    set((s) => ({
      quests: s.quests.map((q) => (q.id === id ? toQuest(row) : q)),
    }));
  },

  incrementLegendary: async (id) => {
    const row = await patchQuest(id, 'increment');
    set((s) => ({
      legendaryQuests: s.legendaryQuests.map((q) =>
        q.id === id ? toLegendary(row) : q,
      ),
    }));
  },

  decrementLegendary: async (id) => {
    const row = await patchQuest(id, 'decrement');
    set((s) => ({
      legendaryQuests: s.legendaryQuests.map((q) =>
        q.id === id ? toLegendary(row) : q,
      ),
    }));
  },

  resetLegendary: async (id) => {
    const row = await patchQuest(id, 'reset');
    set((s) => ({
      legendaryQuests: s.legendaryQuests.map((q) =>
        q.id === id ? toLegendary(row) : q,
      ),
    }));
  },

  startLegendaryQuest: async (id) => {
    const row = await patchQuest(id, 'start');
    set((s) => ({
      legendaryQuests: s.legendaryQuests.map((q) =>
        q.id === id ? toLegendary(row) : q,
      ),
    }));
  },

  completeLegendaryQuest: async (id) => {
    await deleteQuest(id, true);
    await get().hydrate();
  },

  useStreakSaveLegendary: async (id) => {
    const row = await patchQuest(id, 'useStreakSave');
    set((s) => ({
      legendaryQuests: s.legendaryQuests.map((q) =>
        q.id === id ? toLegendary(row) : q,
      ),
    }));
  },
}));
