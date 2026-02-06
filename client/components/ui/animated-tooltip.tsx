"use client";

import Image from "next/image";
import React, { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type AnimatedTooltipItem = {
  id: number;
  name: string;
  designation: string;
  image: string;
  priority?: number | null;
};

type AnimatedTooltipProps = {
  items: AnimatedTooltipItem[];
  className?: string;
  onSelect?: (item: AnimatedTooltipItem) => void;
  imageSize?: number;
  tooltipZIndex?: number;
};

export const AnimatedTooltip = ({ items, className, onSelect, imageSize = 72, tooltipZIndex = 50 }: AnimatedTooltipProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const springConfig = { stiffness: 200, damping: 20 };
  const x = useMotionValue(0);
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-6, 6]),
    springConfig
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-12, 12]),
    springConfig
  );
  const handleMouseMove = (event: React.MouseEvent<HTMLImageElement>) => {
    const halfWidth = event.currentTarget.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  return (
    <div className={cn("relative z-30 mx-auto flex flex-wrap items-start justify-start gap-x-10 gap-y-12 max-w-[550px]", className)}>
      {[...items]
        .sort((a, b) => {
          const getPriority = (i: AnimatedTooltipItem) =>
            typeof i.priority === "number" ? i.priority : Number.MAX_SAFE_INTEGER;
          return getPriority(a) - getPriority(b);
        })
        .map((item) => (
        <div
          className="relative group cursor-pointer"
          key={item.id}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => onSelect?.(item)}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "tween",
                    ease: "easeOut",
                    duration: 0.2,
                  },
                }}
                exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15, ease: "easeIn" } }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                  zIndex: tooltipZIndex,
                }}
                className="absolute -top-16 -left-1/2 translate-x-1/2 flex text-xs flex-col items-center justify-center rounded-md bg-foreground shadow-xl px-4 py-2"
              >
                <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent h-px" />
                <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px" />
                <div className="font-bold text-background relative z-30 text-base">
                  {item.name}
                </div>
                <div className="text-muted-foreground text-xs">
                  {item.designation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Image
            onMouseMove={handleMouseMove}
            height={imageSize}
            width={imageSize}
            src={item.image}
            alt={item.name}
            style={{ height: imageSize, width: imageSize }}
            className="relative rounded-full border-2 border-background object-cover object-top transition duration-500 group-hover:z-30 group-hover:scale-125"
          />
        </div>
      ))}
    </div>
  );
};
