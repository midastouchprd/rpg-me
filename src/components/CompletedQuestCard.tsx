'use client';

import { CompletedQuest } from '@/types/quest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Props = {
  quest: CompletedQuest;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function CompletedQuestCard({ quest }: Props) {
  const isLegendary = quest.isLegendary;

  return (
    <Card
      className={
        isLegendary
          ? 'bg-amber-950/60 border-amber-700'
          : 'bg-emerald-950 border-emerald-700'
      }>
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <div className='flex items-center gap-2'>
              {isLegendary && <span className='text-sm'>⭐</span>}
              <CardTitle
                className={`text-base font-semibold leading-snug font-heading ${
                  isLegendary ? 'text-amber-200' : 'text-emerald-100'
                }`}>
                {quest.title}
              </CardTitle>
            </div>
            <p
              className={`text-sm mt-1 ${
                isLegendary ? 'text-amber-400' : 'text-emerald-400'
              }`}>
              Quest Giver: {quest.questGiver}
            </p>
          </div>
          <Badge
            className={
              isLegendary
                ? 'bg-amber-700/60 text-amber-200 border border-amber-500 shrink-0'
                : 'bg-emerald-700/60 text-emerald-200 border border-emerald-600 shrink-0'
            }>
            {isLegendary ? 'Legendary' : 'Complete'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between text-sm'>
          <span className={isLegendary ? 'text-amber-500' : 'text-emerald-500'}>
            {quest.goalDays} day goal
          </span>
          <span className={isLegendary ? 'text-amber-600' : 'text-emerald-600'}>
            Completed {formatDate(quest.completedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
