'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SignInButton, UserButton, Show } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type CharacterCard = {
  slug: string;
  name: string;
  activeQuests: number;
  completedQuests: number;
};

export default function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/characters')
      .then((r) => r.json())
      .then((data) => {
        setCharacters(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <header className='border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10'>
        <div className='max-w-2xl mx-auto px-4 py-4'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <Link href='/'>
                <h1 className='text-2xl font-bold tracking-[0.1em] text-white font-heading'>
                  ⚔️ RPG-<span className='text-blue-400'>Me</span>
                </h1>
              </Link>
              <p className='text-xs text-zinc-500 mt-0.5'>All Characters</p>
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
        </div>
      </header>

      <main className='max-w-2xl mx-auto px-4 py-8'>
        {loading ? (
          <p className='text-zinc-500 text-sm animate-pulse text-center py-12'>
            Loading characters...
          </p>
        ) : characters.length === 0 ? (
          <p className='text-zinc-600 text-sm italic text-center py-12'>
            No public characters yet.
          </p>
        ) : (
          <div className='space-y-3'>
            {characters.map((c) => (
              <Link
                key={c.slug}
                href={`/character/${c.slug}`}
                className='block group'>
                <Card className='bg-zinc-900 border-zinc-700 hover:border-zinc-500 transition-colors cursor-pointer'>
                  <CardHeader className='pb-2'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-base font-semibold text-white font-heading group-hover:text-blue-300 transition-colors'>
                        {c.name}
                      </CardTitle>
                      <span className='text-xs text-zinc-500'>{c.slug}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='flex gap-6 text-sm'>
                      <div>
                        <span className='text-zinc-400'>Active quests: </span>
                        <span className='text-blue-300 font-medium'>
                          {c.activeQuests}
                        </span>
                      </div>
                      <div>
                        <span className='text-zinc-400'>Completed quests: </span>
                        <span className='text-emerald-400 font-medium'>
                          {c.completedQuests}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
