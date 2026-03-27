'use client';

import { Quest } from '@/types/quest';
import { useQuestStore } from '@/store/questStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type Props = {
  quest: Quest;
  disabled?: boolean;
};

export function QuestCard({ quest, disabled = false }: Props) {
  const {
    incrementQuest,
    decrementQuest,
    resetQuest,
    completeQuest,
    useStreakSave: applyStreakSave,
  } = useQuestStore();

  const progress = (quest.currentStreak / quest.goalDays) * 100;

  function handleIncrement() {
    if (quest.currentStreak + 1 >= quest.goalDays) {
      completeQuest(quest.id);
    } else {
      incrementQuest(quest.id);
    }
  }

  return (
    <Card className='bg-slate-800 border-slate-600 text-slate-100'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <CardTitle className='text-base font-semibold leading-snug text-white font-heading'>
              {quest.title}
            </CardTitle>
            <p className='text-sm text-slate-400 mt-1'>
              Quest Giver: {quest.questGiver}
            </p>
          </div>
          <Badge className='bg-blue-700/50 text-blue-200 border border-blue-600 shrink-0'>
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-1.5'>
          <div className='flex justify-between text-sm'>
            <span className='text-slate-400'>Progress</span>
            <span className='text-white font-medium'>
              {quest.currentStreak} / {quest.goalDays} days
            </span>
          </div>
          <Progress
            value={progress}
            className='h-2'
            trackClassName='bg-slate-600/50'
            indicatorClassName='bg-blue-500'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => decrementQuest(quest.id)}
            disabled={disabled || quest.currentStreak <= 0}
            className='border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-30'>
            −
          </Button>
          <Button
            size='sm'
            onClick={handleIncrement}
            disabled={disabled}
            className='bg-blue-600 hover:bg-blue-500 text-white'>
            +
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => applyStreakSave(quest.id)}
            disabled={disabled || !quest.streakSaveToken}
            title={
              quest.streakSaveToken
                ? 'Use streak save token to protect your streak for a missed day'
                : 'Streak save token already used'
            }
            className='border-amber-600 bg-amber-900/40 text-amber-300 hover:bg-amber-800/60 disabled:opacity-30 disabled:border-slate-600 disabled:text-slate-500'>
            🛡️
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => resetQuest(quest.id)}
            disabled={disabled}
            className='text-slate-400 hover:text-slate-200 hover:bg-slate-700 ml-auto'>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
