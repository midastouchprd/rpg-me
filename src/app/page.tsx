'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    fetch('/api/quests')
      .then((r) => r.json())
      .then((data) => {
        if (data?.character?.slug) {
          router.replace(`/character/${data.character.slug}`);
        }
      })
      .catch(() => {});
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className='min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center'>
        <p className='text-zinc-500 text-sm animate-pulse'>Loading...</p>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className='min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center'>
        <p className='text-zinc-500 text-sm animate-pulse'>
          Loading your character...
        </p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4'>
      <div className='w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 space-y-4 text-center'>
        <h1 className='text-2xl font-bold text-white font-heading'>
          RPG-<span className='text-blue-400'>Me</span>
        </h1>
        <p className='text-sm text-zinc-400'>
          Sign in to access and manage your character quests.
        </p>
        <SignInButton mode='modal'>
          <Button className='bg-zinc-100 text-zinc-900 hover:bg-zinc-300 w-full'>
            Sign in
          </Button>
        </SignInButton>
      </div>
    </div>
  );
}
