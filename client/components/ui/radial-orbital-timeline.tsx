'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TimelineStatus = 'completed' | 'in-progress' | 'pending';

export type TimelineItem = {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: TimelineStatus;
};

type RadialOrbitalTimelineProps = {
  timelineData: TimelineItem[];
};

export function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    let rotationTimer: NodeJS.Timeout | null = null;

    if (autoRotate && timelineData.length) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => Number(((prev + 0.35) % 360).toFixed(3)));
      }, 50);
    }

    return () => {
      if (rotationTimer) clearInterval(rotationTimer);
    };
  }, [autoRotate, timelineData.length]);

  const getRelatedItems = (itemId: number) => {
    const current = timelineData.find((item) => item.id === itemId);
    return current?.relatedIds ?? [];
  };

  const isRelated = (itemId: number) => {
    if (!activeNodeId) return false;
    return getRelatedItems(activeNodeId).includes(itemId);
  };

  const centerViewOnNode = (nodeId: number) => {
    const index = timelineData.findIndex((item) => item.id === nodeId);
    if (index === -1) return;
    const targetAngle = (index / timelineData.length) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const next: Record<number, boolean> = {};
      Object.keys(prev).forEach((key) => {
        next[Number(key)] = Number(key) === id ? !prev[id] : false;
      });

      if (!prev[id]) {
        next[id] = true;
        setActiveNodeId(id);
        setAutoRotate(false);
        centerViewOnNode(id);

        const related = getRelatedItems(id);
        const pulseState: Record<number, boolean> = {};
        related.forEach((relatedId) => {
          pulseState[relatedId] = true;
        });
        setPulseEffect(pulseState);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return next;
    });
  };

  const calculatePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 160;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 40 * Math.cos(radian));
    const opacity = Math.max(0.35, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));

    return { x, y, zIndex, opacity };
  };

  const statusStyles: Record<TimelineStatus, string> = {
    completed: 'text-white bg-black border-white',
    'in-progress': 'text-black bg-white border-black',
    pending: 'text-white bg-black/40 border-white/50',
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === containerRef.current || event.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleBackdropClick}
      className='relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl bg-black py-10'
    >
      <div ref={orbitRef} className='relative flex h-[480px] w-full max-w-4xl items-center justify-center'>
        <div className='absolute flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 shadow-[0_0_40px_rgba(59,130,246,0.65)]'>
          <div className='absolute h-20 w-20 animate-ping rounded-full border border-white/30 opacity-70' />
          <div className='absolute h-24 w-24 animate-ping rounded-full border border-white/10 opacity-40 [animation-delay:0.45s]' />
          <div className='h-8 w-8 rounded-full bg-white/80 backdrop-blur-md' />
        </div>

        <div className='absolute h-[380px] w-[380px] rounded-full border border-white/10' />

        {timelineData.map((item, index) => {
          const { x, y, zIndex, opacity } = calculatePosition(index, timelineData.length);
          const Icon = item.icon;
          const isExpanded = !!expandedItems[item.id];
          const related = isRelated(item.id);
          const pulsing = pulseEffect[item.id];

          return (
            <div
              key={item.id}
              ref={(el) => {
                nodeRefs.current[item.id] = el;
              }}
              onClick={(event) => {
                event.stopPropagation();
                toggleItem(item.id);
              }}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                zIndex: isExpanded ? 200 : zIndex,
                opacity: isExpanded ? 1 : opacity,
              }}
              className='absolute cursor-pointer transition-all duration-700'
            >
              <div
                className={`absolute -inset-1 rounded-full ${
                  pulsing ? 'animate-pulse duration-1000' : ''
                }`}
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)',
                }}
              />

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isExpanded
                    ? 'scale-150 border-white bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.45)]'
                    : related
                    ? 'border-white bg-white/60 text-black'
                    : 'border-white/40 bg-black text-white'
                }`}
              >
                <Icon size={18} />
              </div>

              <div
                className={`absolute top-12 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300 ${
                  isExpanded ? 'scale-110 text-white' : 'text-white/70'
                }`}
              >
                {item.title}
              </div>

              {isExpanded ? (
                <Card className='absolute left-1/2 top-20 w-64 -translate-x-1/2 bg-black/90 backdrop-blur-xl transition-all duration-300'>
                  <CardHeader className='pb-2'>
                    <div className='flex items-center justify-between'>
                      <Badge className={`px-2 text-xs ${statusStyles[item.status]}`}>
                        {item.status === 'completed'
                          ? 'COMPLETE'
                          : item.status === 'in-progress'
                          ? 'IN PROGRESS'
                          : 'PENDING'}
                      </Badge>
                      <span className='font-mono text-xs text-white/50'>{item.date}</span>
                    </div>
                    <CardTitle className='mt-2 text-sm text-white'>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className='text-xs text-white/80'>
                    <p>{item.content}</p>

                    {item.relatedIds.length > 0 && (
                      <div className='mt-4 border-t border-white/10 pt-3'>
                        <div className='mb-2 flex items-center text-white/70'>
                          <LinkIcon size={10} className='mr-1' />
                          <h4 className='text-xs font-medium uppercase tracking-wider'>关联节点</h4>
                        </div>
                        <div className='flex flex-wrap gap-1'>
                          {item.relatedIds.map((relatedId) => {
                            const relatedItem = timelineData.find((candidate) => candidate.id === relatedId);
                            return (
                              <Button
                                key={relatedId}
                                variant='outline'
                                size='sm'
                                className='flex h-6 items-center rounded-full border-white/20 bg-transparent px-2 text-xs text-white/80 transition-all hover:bg-white/10 hover:text-white'
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleItem(relatedId);
                                }}
                              >
                                {relatedItem?.title}
                                <ArrowRight size={10} className='ml-1 text-white/60' />
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RadialOrbitalTimeline;
