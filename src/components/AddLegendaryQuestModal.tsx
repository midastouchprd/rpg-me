'use client';

import { useState } from 'react';
import { useQuestStore } from '@/store/questStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  disabled?: boolean;
};

export function AddLegendaryQuestModal({ disabled = false }: Props) {
  const { addLegendaryQuest } = useQuestStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [questGiver, setQuestGiver] = useState('');
  const [goalDays, setGoalDays] = useState('');
  const [requirement, setRequirement] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const days = parseInt(goalDays, 10);
    if (!title.trim() || !questGiver.trim() || isNaN(days) || days < 1) return;
    addLegendaryQuest(
      title.trim(),
      questGiver.trim(),
      days,
      requirement.trim() || undefined,
    );
    setTitle('');
    setQuestGiver('');
    setGoalDays('');
    setRequirement('');
    setOpen(false);
  }

  return (
    <>
      <Button
        size='sm'
        onClick={() => setOpen(true)}
        disabled={disabled}
        className='bg-amber-700 hover:bg-amber-600 text-white'>
        + Add Legendary
      </Button>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (disabled) {
            setOpen(false);
            return;
          }
          setOpen(nextOpen);
        }}>
        <DialogContent className='bg-slate-900 border-amber-800 text-slate-100'>
          <DialogHeader>
            <DialogTitle className='text-amber-300'>
              New Legendary Quest
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className='space-y-4 mt-2'>
            <div className='space-y-1.5'>
              <Label
                htmlFor='leg-title'
                className='text-slate-300'>
                Quest Title
              </Label>
              <Input
                id='leg-title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='e.g. Stay under 400lbs for 7 consecutive days'
                className='bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500'
              />
            </div>
            <div className='space-y-1.5'>
              <Label
                htmlFor='leg-giver'
                className='text-slate-300'>
                Quest Giver
              </Label>
              <Input
                id='leg-giver'
                value={questGiver}
                onChange={(e) => setQuestGiver(e.target.value)}
                placeholder='e.g. Doctor'
                className='bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500'
              />
            </div>
            <div className='space-y-1.5'>
              <Label
                htmlFor='leg-days'
                className='text-slate-300'>
                Goal Days
              </Label>
              <Input
                id='leg-days'
                type='number'
                min={1}
                value={goalDays}
                onChange={(e) => setGoalDays(e.target.value)}
                placeholder='e.g. 30'
                className='bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500'
              />
            </div>
            <div className='space-y-1.5'>
              <Label
                htmlFor='leg-requirement'
                className='text-slate-300'>
                Unlock Requirement{' '}
                <span className='text-slate-500 font-normal'>(optional)</span>
              </Label>
              <Input
                id='leg-requirement'
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder='e.g. Reach 399lbs to begin this quest'
                className='bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500'
              />
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => setOpen(false)}
                disabled={disabled}
                className='text-slate-400 hover:text-slate-200'>
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={disabled}
                className='bg-amber-700 hover:bg-amber-600 text-white'>
                Accept Quest
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
