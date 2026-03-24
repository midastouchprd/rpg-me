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

export function AddQuestModal() {
  const { addQuest } = useQuestStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [questGiver, setQuestGiver] = useState('');
  const [goalDays, setGoalDays] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const days = parseInt(goalDays, 10);
    if (!title.trim() || !questGiver.trim() || isNaN(days) || days < 1) return;
    addQuest(title.trim(), questGiver.trim(), days);
    setTitle('');
    setQuestGiver('');
    setGoalDays('');
    setOpen(false);
  }

  return (
    <>
      <Button
        size='sm'
        onClick={() => setOpen(true)}
        className='bg-blue-600 hover:bg-blue-500 text-white'>
        + Add Quest
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}>
        <DialogContent className='bg-slate-900 border-slate-700 text-slate-100'>
          <DialogHeader>
            <DialogTitle className='text-white'>New Quest</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className='space-y-4 mt-2'>
            <div className='space-y-1.5'>
              <Label
                htmlFor='quest-title'
                className='text-slate-300'>
                Quest Title
              </Label>
              <Input
                id='quest-title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='e.g. Walk 5,000 steps X days in a row'
                className='bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500'
              />
            </div>
            <div className='space-y-1.5'>
              <Label
                htmlFor='quest-giver'
                className='text-slate-300'>
                Quest Giver
              </Label>
              <Input
                id='quest-giver'
                value={questGiver}
                onChange={(e) => setQuestGiver(e.target.value)}
                placeholder='e.g. Doctor, Friend'
                className='bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500'
              />
            </div>
            <div className='space-y-1.5'>
              <Label
                htmlFor='goal-days'
                className='text-slate-300'>
                Goal Days
              </Label>
              <Input
                id='goal-days'
                type='number'
                min={1}
                value={goalDays}
                onChange={(e) => setGoalDays(e.target.value)}
                placeholder='e.g. 7'
                className='bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500'
              />
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => setOpen(false)}
                className='text-slate-400 hover:text-slate-200'>
                Cancel
              </Button>
              <Button
                type='submit'
                className='bg-blue-600 hover:bg-blue-500 text-white'>
                Accept Quest
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
