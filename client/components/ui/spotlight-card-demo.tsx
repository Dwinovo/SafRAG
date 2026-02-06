'use client';

import React, { useEffect, useState } from 'react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Sparkle } from 'lucide-react';

const SparkleIcon = () => (
  <Sparkle className='h-6 w-6' style={{ color: 'var(--icon-color)' }} />
);

export const SpotlightCardDemo = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className='flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 transition-colors duration-300 dark:bg-white'>
      <div className='absolute right-4 top-4'>
        <button
          type='button'
          onClick={() => setIsDark((prev) => !prev)}
          className='rounded-full border border-gray-700 bg-gray-900 p-2 text-white transition-colors dark:border-gray-300 dark:bg-gray-100 dark:text-black'
        >
          切换主题
        </button>
      </div>

      <SpotlightCard className='h-[350px] w-[300px] gap-4'>
        <SparkleIcon />
        <h2 className='text-2xl font-bold' style={{ color: 'var(--heading-text)' }}>
          Boost Your Experience
        </h2>
        <p className='text-sm leading-relaxed' style={{ color: 'var(--paragraph-text)' }}>
          Get exclusive benefits, features & 24/7 support as a permanent club member.
        </p>
        <button
          type='button'
          className='mt-4 rounded-lg px-6 py-2 text-sm font-medium transition-colors'
          style={{
            backgroundColor: 'var(--button-bg)',
            color: 'var(--button-text)',
          }}
        >
          Join now
        </button>
      </SpotlightCard>
    </div>
  );
};
