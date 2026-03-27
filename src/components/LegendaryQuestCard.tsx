'use client';

import { LegendaryQuest } from '@/types/quest';
import { useQuestStore } from '@/store/questStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type Props = {
  quest: LegendaryQuest;
  disabled?: boolean;
};

export function LegendaryQuestCard({ quest, disabled = false }: Props) {
  const {
    incrementLegendary,
    decrementLegendary,
    resetLegendary,
    startLegendaryQuest,
    completeLegendaryQuest,
    useStreakSaveLegendary: applyStreakSaveLegendary,
  } = useQuestStore();

  const progress = (quest.currentStreak / quest.goalDays) * 100;

  function handleIncrement() {
    if (quest.currentStreak + 1 >= quest.goalDays) {
      completeLegendaryQuest(quest.id);
    } else {
      incrementLegendary(quest.id);
    }
  }

  if (!quest.isStarted) {
    return (
      <Card className='bg-zinc-800 border-zinc-600 opacity-80'>
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0'>
              <div className='flex items-center gap-2'>
                <span className='text-base'>🔒</span>
                <CardTitle className='text-base font-semibold leading-snug text-zinc-400 font-heading'>
                  {quest.title}
                </CardTitle>
              </div>
              <p className='text-sm text-zinc-500 mt-1'>
                Quest Giver: {quest.questGiver}
              </p>
              {quest.questGiverTitle && (
                <p className='text-xs text-zinc-600'>{quest.questGiverTitle}</p>
              )}
            </div>
            <Badge className='bg-zinc-700 text-zinc-400 border border-zinc-600 shrink-0'>
              Locked
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          {quest.requirement && (
            <p className='text-sm text-zinc-500 italic'>
              Requirement: {quest.requirement}
            </p>
          )}
          <Button
            size='sm'
            onClick={() => startLegendaryQuest(quest.id)}
            disabled={disabled}
            className='bg-amber-700 hover:bg-amber-600 text-white'>
            Start Quest
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className='bg-amber-950 border-amber-600 text-amber-100'
      style={{ boxShadow: '0 0 16px rgba(192, 112, 0, 0.2)' }}>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <div className='flex items-center gap-2'>
              <span className='text-base'>⭐</span>
              <CardTitle className='text-base font-semibold leading-snug text-amber-200 font-heading'>
                {quest.title}
              </CardTitle>
            </div>
            <p className='text-sm text-amber-400 mt-1'>
              Quest Giver: {quest.questGiver}
            </p>
            {quest.questGiverTitle && (
              <p className='text-xs text-amber-500/70'>
                {quest.questGiverTitle}
              </p>
            )}
          </div>
          <Badge className='bg-amber-700/60 text-amber-200 border border-amber-500 shrink-0'>
            Legendary
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-1.5'>
          <div className='flex justify-between text-sm'>
            <span className='text-amber-400'>Progress</span>
            <span className='text-amber-200 font-medium'>
              {quest.currentStreak} / {quest.goalDays} days
            </span>
          </div>
          <Progress
            value={progress}
            className='h-2'
            trackClassName='bg-amber-950'
            indicatorClassName='bg-amber-500'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => decrementLegendary(quest.id)}
            disabled={disabled || quest.currentStreak <= 0}
            className='border-amber-700 bg-amber-900/50 text-amber-200 hover:bg-amber-800 disabled:opacity-30'>
            −
          </Button>
          <Button
            size='sm'
            onClick={handleIncrement}
            disabled={disabled}
            className='bg-amber-600 hover:bg-amber-500 text-white'>
            +
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => applyStreakSaveLegendary(quest.id)}
            disabled={disabled || !quest.streakSaveToken}
            title={
              quest.streakSaveToken
                ? 'Use streak save token to protect your streak for a missed day'
                : 'Streak save token already used'
            }
            className='border-yellow-500 bg-yellow-900/40 text-yellow-300 hover:bg-yellow-800/60 disabled:opacity-30 disabled:border-amber-800 disabled:text-amber-700'>
            🛡️
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => resetLegendary(quest.id)}
            disabled={disabled}
            className='text-amber-400 hover:text-amber-200 hover:bg-amber-900 ml-auto'>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
