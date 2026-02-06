"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type MorphingPageDotsProps = {
  total: number;
  current?: number;
  onChange?: (pageIndex: number) => void;
  className?: string;
};

export default function MorphingPageDots({
  total,
  current,
  onChange,
  className,
}: MorphingPageDotsProps) {
  const [internalPage, setInternalPage] = React.useState(0);
  const isControlled = typeof current === "number";
  const safeTotal = total > 0 ? total : 1;

  React.useEffect(() => {
    if (!isControlled) {
      setInternalPage((prev) => Math.min(prev, safeTotal - 1));
    }
  }, [safeTotal, isControlled]);

  const page = isControlled ? Math.min(Math.max(current ?? 0, 0), safeTotal - 1) : internalPage;

  const setPage = React.useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), safeTotal - 1);
      if (!isControlled) {
        setInternalPage(clamped);
      }
      onChange?.(clamped);
    },
    [isControlled, onChange, safeTotal],
  );

  React.useEffect(() => {
    if (isControlled && typeof current === "number" && current >= safeTotal) {
      onChange?.(safeTotal - 1);
    }
  }, [isControlled, current, safeTotal, onChange]);

  const goPrev = () => setPage(page - 1);
  const goNext = () => setPage(page + 1);

  return (
    <div className={cn("flex items-center justify-center gap-6", className)}>
      <ChevronLeft
        onClick={goPrev}
        className={`h-6 w-6 cursor-pointer text-muted-foreground transition hover:text-foreground ${
          page === 0 ? "pointer-events-none opacity-30" : ""
        }`}
      />

      <div className="flex items-center gap-3">
        {Array.from({ length: safeTotal }).map((_, index) => {
          const isActive = index === page;
          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              className="relative cursor-pointer"
              animate={{
                width: isActive ? 28 : 10,
                height: 10,
                borderRadius: 9999,
                backgroundColor: isActive ? "var(--primary)" : "rgba(148, 163, 184, 0.4)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              {isActive && (
                <AnimatePresence>
                  <motion.span
                    key="ripple"
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: "rgba(148, 163, 184, 0.3)" }}
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                </AnimatePresence>
              )}
            </motion.button>
          );
        })}
      </div>

      <ChevronRight
        onClick={goNext}
        className={`h-6 w-6 cursor-pointer text-muted-foreground transition hover:text-foreground ${
          page === safeTotal - 1 ? "pointer-events-none opacity-30" : ""
        }`}
      />
    </div>
  );
}
