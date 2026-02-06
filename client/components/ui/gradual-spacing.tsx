"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface GradualSpacingProps {
  text: string;
  duration?: number;
  delayMultiple?: number;
  framerProps?: Variants;
  className?: string;
}

function GradualSpacing({
  text,
  duration = 0.5,
  delayMultiple = 0.04,
  framerProps = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  className,
}: GradualSpacingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      const handler = () => setReduced(mq.matches)
      handler()
      mq.addEventListener?.("change", handler)
      return () => mq.removeEventListener?.("change", handler)
    }
  }, [])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const io = new IntersectionObserver((entries) => {
      setInView(entries[0]?.isIntersecting ?? true)
    }, { threshold: 0.1 })
    io.observe(node)
    return () => io.disconnect()
  }, [])

  const enableMotion = inView && !reduced

  return (
    <div ref={containerRef} className="flex justify-center space-x-1">
      {enableMotion ? (
        <AnimatePresence>
          {text.split("").map((char, i) => (
            <motion.h1
              key={i}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={framerProps}
              transition={{ duration, delay: i * delayMultiple }}
              className={cn("drop-shadow-sm", className)}
            >
              {char === " " ? <span>&nbsp;</span> : char}
            </motion.h1>
          ))}
        </AnimatePresence>
      ) : (
        <h1 className={cn("drop-shadow-sm", className)}>{text}</h1>
      )}
    </div>
  );
}

export { GradualSpacing };


