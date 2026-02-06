'use client';

import { GlareCard } from '@/components/ui/glare-card';

const DEMO_IMAGE =
  'https://images.unsplash.com/photo-1512618831669-521d4b375f5d?q=80&w=1800&auto=format&fit=crop';

export function GlareCardDemo() {
  return (
    <div className='grid grid-cols-1 gap-10 md:grid-cols-3'>
      <GlareCard className='flex h-full flex-col items-center justify-center gap-4 text-white'>
        <svg
          width='66'
          height='65'
          viewBox='0 0 66 65'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='h-14 w-14 text-white'
        >
          <path
            d='M8 8.05571C8 8.05571 54.9009 18.1782 57.8687 30.062C60.8365 41.9458 9.05432 57.4696 9.05432 57.4696'
            stroke='currentColor'
            strokeWidth='15'
            strokeMiterlimit='3.86874'
            strokeLinecap='round'
          />
        </svg>
        <p className='text-center text-sm text-white/80'>
          Move your cursor to reveal the holographic glare.
        </p>
      </GlareCard>
      <GlareCard className='relative flex h-full w-full items-center justify-center overflow-hidden'>
        <img
          className='absolute inset-0 h-full w-full object-cover'
          src={DEMO_IMAGE}
          alt='Demo image'
        />
      </GlareCard>
      <GlareCard className='flex h-full flex-col items-start justify-end gap-4 px-6 py-8 text-white'>
        <p className='text-lg font-bold'>The greatest trick</p>
        <p className='text-base font-normal text-neutral-200'>
          The greatest trick the devil ever pulled was to convince the world that he didn&apos;t
          exist.
        </p>
      </GlareCard>
    </div>
  );
}
