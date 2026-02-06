'use client';

import { ReactLenis } from 'lenis/react';
import { useTransform, motion, useScroll, type MotionValue } from 'motion/react';
import {
  forwardRef,
  type ForwardedRef,
  type HTMLAttributes,
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useRef,
} from 'react';
import { ArrowRight } from 'lucide-react';
import { Typewriter } from '@/components/ui/typewriter-text';
import { cn } from '@/lib/utils';

interface ProjectData {
  title: string;
  description: string;
  link: string;
  color: string;
  href?: string;
}

interface CardProps {
  i: number;
  title: string;
  description: string;
  url: string;
  color: string;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
  href?: string;
  stackSpacing: number;
}

const Card = ({
  i,
  title,
  description,
  url,
  color,
  progress,
  range,
  targetScale,
  href,
  stackSpacing,
}: CardProps) => {
  const container = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const [rangeStart, rangeEnd] = range;
  const safeRangeEnd = rangeEnd <= rangeStart ? rangeStart + 0.0001 : rangeEnd;
  const scale = useTransform(progress, [rangeStart, safeRangeEnd], [1, targetScale], {
    clamp: true,
  });

  return (
    <div
      ref={container}
      className='h-screen flex items-center justify-center sticky top-0'
    >
      <motion.div
        style={{
          backgroundColor: color,
          scale,
          top: `calc(-5vh + ${i * stackSpacing}px)`,
        }}
        className='flex flex-col relative -top-[25%] h-[580px] w-[55%] rounded-md p-10 origin-top text-white'
      >
        <h2 className='text-3xl sm:text-4xl text-center font-semibold'>{title}</h2>
        <div className='flex h-full mt-5 gap-10'>
          <div className='w-[40%] relative top-[10%]'>
            <p className='text-base sm:text-lg leading-relaxed'>{description}</p>
            <span className='flex items-center gap-2 pt-3 text-base sm:text-lg'>
              <a
                href={href ?? '#'}
                target='_blank'
                rel='noopener noreferrer'
                className='underline cursor-pointer'
              >
                查看详情
              </a>
              <ArrowRight className='h-4 w-4' />
            </span>
          </div>

          <div className='relative w-[60%] h-full rounded-lg overflow-hidden'>
            <motion.div
              className='w-full h-full'
              style={{ scale: imageScale }}
            >
              <img
                src={url}
                alt='image'
                className='absolute inset-0 w-full h-full object-cover'
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface StackingCardProps extends HTMLAttributes<HTMLElement> {
  projects: ProjectData[];
  renderBeforeCards?: ReactNode;
}

const StackingCard = (
  { projects, renderBeforeCards, className, ...rest }: StackingCardProps,
  ref: ForwardedRef<HTMLElement>
) => {
  const container = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  const setContainerRef = useCallback(
    (node: HTMLElement | null) => {
      container.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [ref]
  );

  const totalProjects = projects.length;
  const total = Math.max(totalProjects, 1);
  const spacingBase = total > 1 ? Math.max(12, 28 - total * 1.5) : 0;
  const step = 1 / total;

  return (
    <ReactLenis root>
      <main
        className={cn('relative transition-colors duration-300', className)}
        ref={setContainerRef}
        {...rest}
      >
        <section className='relative h-[30vh] w-full grid place-content-center text-neutral-900 dark:text-neutral-100'>
          <div className='absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#fff_70%,transparent_100%)] dark:[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]' />
          <div className='relative text-center px-8'>
            <Typewriter
              text={["御典安全知识库", "你的知识库"]}
              speed={90}
              loop
              className='text-5xl sm:text-7xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100'
            />
          </div>
        </section>

        {renderBeforeCards}

        <section className='w-full'>
          {projects.map((project, i) => {
            const start = Math.min(i * step, 0.98);
            const end = Math.min(start + step, 1);
            const adjustedEnd = end <= start ? Math.min(1, start + 0.0001) : end;
            const normalizedProgress = (i + 1) / total;
            const baseScale = 0.5;
            const scaleRange = 0.5;
            const targetScale = baseScale + normalizedProgress * scaleRange;
            return (
              <Card
                key={`p_${i}`}
                i={i}
                url={project.link}
                title={project.title}
                color={project.color}
                description={project.description}
                progress={scrollYProgress}
                range={[start, adjustedEnd]}
                targetScale={targetScale}
                href={project.href}
                stackSpacing={spacingBase}
              />
            );
          })}
        </section>

        <div className='group py-8 text-center text-[10vw] md:text-[8vw] leading-[100%] uppercase font-semibold text-neutral-400 dark:text-neutral-600 transition-all ease-linear'>
          御典
        </div>
      </main>
    </ReactLenis>
  );
};

const ForwardedStackingCard = forwardRef<HTMLElement, StackingCardProps>(StackingCard);
ForwardedStackingCard.displayName = 'StackingCard';

export type { ProjectData, StackingCardProps };
export default ForwardedStackingCard;
