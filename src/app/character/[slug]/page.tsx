'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SignInButton, UserButton, Show, useAuth } from '@clerk/nextjs';
import { useQuestStore } from '@/store/questStore';
import { QuestCard } from '@/components/QuestCard';
import { LegendaryQuestCard } from '@/components/LegendaryQuestCard';
import { CompletedQuestCard } from '@/components/CompletedQuestCard';
import { AddQuestModal } from '@/components/AddQuestModal';
import { AddLegendaryQuestModal } from '@/components/AddLegendaryQuestModal';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Quest, LegendaryQuest, CompletedQuest } from '@/types/quest';

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

type CharacterInfo = {
  id: string;
  slug: string;
  name: string;
  isPublic: boolean;
};

export default function CharacterPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isLoaded, isSignedIn } = useAuth();

  const [character, setCharacter] = useState<CharacterInfo | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [visitorQuests, setVisitorQuests] = useState<Quest[]>([]);
  const [visitorLegendary, setVisitorLegendary] = useState<LegendaryQuest[]>([]);
  const [visitorCompleted, setVisitorCompleted] = useState<CompletedQuest[]>([]);

  const {
    quests: storeQuests,
    legendaryQuests: storeLegendary,
    completedQuests: storeCompleted,
    loading: storeLoading,
    errorMessage,
    hydrate,
  } = useQuestStore();

  useEffect(() => {
    if (!isLoaded) return;

    fetch(`/api/character/${slug}`)
      .then((r) => {
        if (r.status === 404) {
          setPageError('Character not found.');
          return null;
        }
        if (r.status === 403) {
          setPageError('This character is private.');
          return null;
        }
        if (!r.ok) {
          setPageError('Failed to load character.');
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setCharacter(data.character);
        setIsOwner(data.isOwner);

        if (data.isOwner) {
          hydrate();
        } else {
          const regular: Quest[] = [];
          const legendary: LegendaryQuest[] = [];
          for (const row of data.quests) {
            if (row.is_legendary || row.isLegendary) {
              legendary.push(toLegendary(row));
            } else {
              regular.push(toQuest(row));
            }
          }
          setVisitorQuests(regular);
          setVisitorLegendary(legendary);
          setVisitorCompleted((data.completedQuests ?? []).map(toCompleted));
        }
      })
      .catch(() => setPageError('Failed to load character.'));
  }, [slug, isLoaded, hydrate]);

  if (!isLoaded || (!character && !pageError)) {
    return (
      <div className='min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center'>
        <p className='text-zinc-500 text-sm animate-pulse'>Loading...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className='min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4'>
        <div className='text-center space-y-3'>
          <p className='text-zinc-400'>{pageError}</p>
          {!isSignedIn && pageError === 'This character is private.' && (
            <SignInButton mode='modal'>
              <Button className='bg-zinc-100 text-zinc-900 hover:bg-zinc-300'>
                Sign in to view
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    );
  }

  const quests = isOwner ? storeQuests : visitorQuests;
  const legendaryQuests = isOwner ? storeLegendary : visitorLegendary;
  const completedQuests = isOwner ? storeCompleted : visitorCompleted;

  if (isOwner && storeLoading && quests.length === 0) {
    return (
      <div className='min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center'>
        <p className='text-zinc-500 text-sm animate-pulse'>Loading quests...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <header className='border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10'>
        <div className='max-w-2xl mx-auto px-4 py-4'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h1 className='text-2xl font-bold tracking-[0.1em] text-white font-heading'>
                ⚔️ RPG-<span className='text-blue-400'>Me</span>
              </h1>
              <p className='text-xs text-zinc-500 mt-0.5'>Self-Care Quest Tracker</p>
              <p className='text-xs text-zinc-400 mt-1'>
                {character!.name}
                <span className='text-zinc-600'> / {character!.slug}</span>
                {!isOwner && (
                  <span className='text-zinc-500 ml-2'>[viewing]</span>
                )}
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Show when='signed-in'>
                <UserButton
                  appearance={{ elements: { avatarBox: 'h-8 w-8' } }}
                />
              </Show>
              <Show when='signed-out'>
                <SignInButton mode='modal'>
                  <Button
                    size='sm'
                    className='bg-zinc-100 text-zinc-900 hover:bg-zinc-300'>
                    Sign in
                  </Button>
                </SignInButton>
              </Show>
            </div>
          </div>
          {errorMessage && (
            <p className='text-xs text-rose-400 mt-2'>{errorMessage}</p>
          )}
          {!isOwner && isSignedIn && (
            <p className='text-xs text-zinc-600 mt-2'>Read-only view.</p>
          )}
        </div>
      </header>

      <main className='max-w-2xl mx-auto px-4 py-8 space-y-10'>
        {/* Active Quests */}
        <section>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-lg font-semibold text-white font-heading'>
                Active Quests
              </h2>
              <p className='text-sm text-zinc-500'>
                {quests.length} quest{quests.length !== 1 ? 's' : ''} in
                progress
              </p>
            </div>
            {isOwner && <AddQuestModal disabled={false} />}
          </div>
          {quests.length === 0 ? (
            <p className='text-zinc-600 text-sm italic py-6 text-center'>
              No active quests.{isOwner ? ' Add one to get started!' : ''}
            </p>
          ) : (
            <div className='space-y-3'>
              {quests.map((q) => (
                <QuestCard
                  key={q.id}
                  quest={q}
                  disabled={!isOwner}
                />
              ))}
            </div>
          )}
        </section>

        <Separator className='bg-zinc-800' />

        {/* Legendary Quests */}
        <section>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-lg font-semibold text-amber-300 font-heading'>
                ⭐ Legendary Quests
              </h2>
              <p className='text-sm text-zinc-500'>
                {legendaryQuests.length} legendary quest
                {legendaryQuests.length !== 1 ? 's' : ''}
              </p>
            </div>
            {isOwner && <AddLegendaryQuestModal disabled={false} />}
          </div>
          {legendaryQuests.length === 0 ? (
            <p className='text-zinc-600 text-sm italic py-6 text-center'>
              No legendary quests yet.
            </p>
          ) : (
            <div className='space-y-3'>
              {legendaryQuests.map((q) => (
                <LegendaryQuestCard
                  key={q.id}
                  quest={q}
                  disabled={!isOwner}
                />
              ))}
            </div>
          )}
        </section>

        <Separator className='bg-zinc-800' />

        {/* Completed Quests */}
        <section className='pb-10'>
          <div className='mb-4'>
            <h2 className='text-lg font-semibold text-emerald-400 font-heading'>
              ✅ Completed Quests
            </h2>
            <p className='text-sm text-zinc-500'>
              {completedQuests.length} quest
              {completedQuests.length !== 1 ? 's' : ''} completed
            </p>
          </div>
          {completedQuests.length === 0 ? (
            <p className='text-zinc-600 text-sm italic py-6 text-center'>
              No completed quests yet. Keep going!
            </p>
          ) : (
            <div className='space-y-3'>
              {completedQuests.map((q) => (
                <CompletedQuestCard
                  key={q.id}
                  quest={q}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
