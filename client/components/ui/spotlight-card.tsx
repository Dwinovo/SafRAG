'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor,
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (!divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);

    if (spotlightColor) {
      divRef.current.style.setProperty('--spotlight-override', spotlightColor);
    }
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={cn(
        'spotlight-card relative flex flex-col items-start overflow-hidden rounded-[25px] p-8 transition-colors duration-300',
        className,
      )}
    >
      <style jsx>{`
        .spotlight-card {
          --card-bg: hsl(0, 0%, 100%);
          --card-border: hsl(0, 0%, 90%);
          --heading-text: hsl(0, 0%, 10%);
          --paragraph-text: hsl(0, 0%, 35%);
          --icon-color: hsl(0, 0%, 20%);
          --button-bg: hsl(0, 0%, 96%);
          --button-text: hsl(0, 0%, 10%);
          --spotlight-default-color: rgba(0, 0, 0, 0.08);

          background-color: var(--card-bg);
          border: 1px solid var(--card-border);
        }

        html.dark .spotlight-card {
          --card-bg: hsl(0, 0%, 100%);
          --card-border: hsl(0, 0%, 88%);
          --heading-text: hsl(0, 0%, 10%);
          --paragraph-text: hsl(0, 0%, 35%);
          --icon-color: hsl(0, 0%, 20%);
          --button-bg: hsl(0, 0%, 96%);
          --button-text: hsl(0, 0%, 10%);
          --spotlight-default-color: rgba(0, 0, 0, 0.08);
        }

        html:not(.dark) .spotlight-card {
          --card-bg: hsl(0, 0%, 100%);
          --card-border: hsl(0, 0%, 90%);
          --heading-text: hsl(0, 0%, 10%);
          --paragraph-text: hsl(0, 0%, 35%);
          --icon-color: hsl(0, 0%, 20%);
          --button-bg: hsl(0, 0%, 96%);
          --button-text: hsl(0, 0%, 10%);
          --spotlight-default-color: rgba(0, 0, 0, 0.08);
        }

        .spotlight-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            580px circle at var(--mouse-x) var(--mouse-y),
            var(--spotlight-override, rgba(80, 150, 255, 0.25)),
            transparent 72%
          );
          opacity: 0;
          transition: opacity 0.35s ease-in-out;
          z-index: 0;
          pointer-events: none;
        }

        .spotlight-card::after {
          content: '';
          position: absolute;
          inset: 1px;
          border-radius: 24px;
          background: radial-gradient(
              360px circle at var(--mouse-x) var(--mouse-y),
              rgba(80, 150, 255, 0.14),
              transparent 68%
            ),
            linear-gradient(120deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0));
          opacity: 0;
          transition: opacity 0.35s ease-in-out;
          z-index: 0;
          pointer-events: none;
        }

        .spotlight-card:hover::before,
        .spotlight-card:hover::after {
          opacity: 1;
        }

        .spotlight-card > * {
          position: relative;
          z-index: 1;
        }
      `}</style>
      {children}
    </div>
  );
};
