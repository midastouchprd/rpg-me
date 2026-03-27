'use client';

import { useEffect } from 'react';
import { useQuestStore } from '@/store/questStore';
import { QuestCard } from '@/components/QuestCard';
import { LegendaryQuestCard } from '@/components/LegendaryQuestCard';
import { CompletedQuestCard } from '@/components/CompletedQuestCard';
import { AddQuestModal } from '@/components/AddQuestModal';
import { AddLegendaryQuestModal } from '@/components/AddLegendaryQuestModal';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const { quests, legendaryQuests, completedQuests, loading, hydrate } =
    useQuestStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (loading && quests.length === 0) {
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
          <h1 className='text-2xl font-bold tracking-[0.1em] text-white font-heading'>
            ⚔️ RPG-<span className='text-blue-400'>Me</span>
          </h1>
          <p className='text-xs text-zinc-500 mt-0.5'>
            Self-Care Quest Tracker
          </p>
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
            <AddQuestModal />
          </div>
          {quests.length === 0 ? (
            <p className='text-zinc-600 text-sm italic py-6 text-center'>
              No active quests. Add one to get started!
            </p>
          ) : (
            <div className='space-y-3'>
              {quests.map((q) => (
                <QuestCard
                  key={q.id}
                  quest={q}
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
            <AddLegendaryQuestModal />
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
