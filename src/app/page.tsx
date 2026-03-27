'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useQuestStore } from '@/store/questStore';
import { QuestCard } from '@/components/QuestCard';
import { LegendaryQuestCard } from '@/components/LegendaryQuestCard';
import { CompletedQuestCard } from '@/components/CompletedQuestCard';
import { AddQuestModal } from '@/components/AddQuestModal';
import { AddLegendaryQuestModal } from '@/components/AddLegendaryQuestModal';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Home() {
  const { quests, legendaryQuests, completedQuests, loading, hydrate } =
    useQuestStore();
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [submittingPin, setSubmittingPin] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    let active = true;

    async function getUnlockStatus() {
      try {
        const res = await fetch('/api/admin/unlock', { method: 'GET' });
        if (!res.ok) return;
        const data = await res.json();
        if (active) {
          setIsAdminUnlocked(Boolean(data.unlocked));
        }
      } catch {
        // Keep default locked state on network errors.
      }
    }

    getUnlockStatus();

    return () => {
      active = false;
    };
  }, []);

  async function handleAdminUnlock(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmittingPin(true);
    setPinError('');

    try {
      const res = await fetch('/api/admin/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPinError(data.error ?? 'Incorrect PIN code.');
        return;
      }

      setIsAdminUnlocked(true);
      setPinInput('');
      setAdminDialogOpen(false);
    } catch {
      setPinError('Could not verify PIN right now. Please try again.');
    } finally {
      setSubmittingPin(false);
    }
  }

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
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h1 className='text-2xl font-bold tracking-[0.1em] text-white font-heading'>
                ⚔️ RPG-<span className='text-blue-400'>Me</span>
              </h1>
              <p className='text-xs text-zinc-500 mt-0.5'>
                Self-Care Quest Tracker
              </p>
            </div>
            <Button
              size='sm'
              variant={isAdminUnlocked ? 'outline' : 'default'}
              onClick={() => {
                setPinError('');
                setAdminDialogOpen(true);
              }}
              className={
                isAdminUnlocked
                  ? 'border-emerald-700 text-emerald-300 hover:bg-emerald-900/30'
                  : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-300'
              }>
              {isAdminUnlocked ? 'Admin: Unlocked' : 'Admin'}
            </Button>
          </div>
          {!isAdminUnlocked && (
            <p className='text-xs text-amber-400 mt-3'>
              Admin lock is active. Enter PIN to enable all quest buttons.
            </p>
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
            <AddQuestModal disabled={!isAdminUnlocked} />
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
                  disabled={!isAdminUnlocked}
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
            <AddLegendaryQuestModal disabled={!isAdminUnlocked} />
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
                  disabled={!isAdminUnlocked}
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

      <Dialog
        open={adminDialogOpen}
        onOpenChange={setAdminDialogOpen}>
        <DialogContent className='bg-zinc-900 border-zinc-700 text-zinc-100'>
          <DialogHeader>
            <DialogTitle className='text-white'>Admin Unlock</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleAdminUnlock}
            className='space-y-4'>
            <div className='space-y-1.5'>
              <Label
                htmlFor='admin-pin'
                className='text-zinc-300'>
                Enter PIN
              </Label>
              <Input
                id='admin-pin'
                type='password'
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder='PIN code'
                autoFocus
                className='bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500'
              />
            </div>
            {pinError && <p className='text-sm text-rose-400'>{pinError}</p>}
            <div className='flex justify-end gap-2 pt-1'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => setAdminDialogOpen(false)}
                className='text-zinc-400 hover:text-zinc-100'>
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={submittingPin || !pinInput.trim()}
                className='bg-zinc-100 text-zinc-900 hover:bg-zinc-300'>
                {submittingPin ? 'Checking...' : 'Unlock'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
