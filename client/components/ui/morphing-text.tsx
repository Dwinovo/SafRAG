"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const morphTime = 1.2; // faster morph duration (seconds)
const cooldownTime = 2.0; // longer pause between morphs (seconds)

const useMorphingText = (texts: string[], enabled: boolean) => {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());

  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const setStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current];
      if (!current1 || !current2) return;

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

      current1.textContent = texts[textIndexRef.current % texts.length];
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    },
    [texts],
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    let fraction = morphRef.current / morphTime;

    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (current1 && current2) {
      current2.style.filter = "none";
      current2.style.opacity = "100%";
      current1.style.filter = "none";
      current1.style.opacity = "0%";
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      // ensure static state without animation
      cooldownRef.current = cooldownTime;
      morphRef.current = 0;
      const c1 = text1Ref.current;
      const c2 = text2Ref.current;
      if (c1 && c2) {
        c2.style.filter = "none";
        c2.style.opacity = "100%";
        c1.style.filter = "none";
        c1.style.opacity = "0%";
        c1.textContent = texts[textIndexRef.current % texts.length];
        c2.textContent = texts[(textIndexRef.current + 1) % texts.length];
      }
      return;
    }

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      cooldownRef.current -= dt;

      if (cooldownRef.current <= 0) doMorph();
      else doCooldown();
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [doMorph, doCooldown, enabled, texts]);

  return { text1Ref, text2Ref };
};

interface MorphingTextProps {
  className?: string;
  texts: string[];
}

const Texts: React.FC<Pick<MorphingTextProps, "texts"> & { enabled: boolean }> = ({ texts, enabled }) => {
  const { text1Ref, text2Ref } = useMorphingText(texts, enabled);
  return (
    <>
      <span
        className="absolute left-1/2 -translate-x-1/2 top-0 inline-block w-auto whitespace-nowrap"
        ref={text1Ref}
      />
      <span
        className="absolute left-1/2 -translate-x-1/2 top-0 inline-block w-auto whitespace-nowrap"
        ref={text2Ref}
      />
    </>
  );
};

const SvgFilters: React.FC = () => (
  <svg id="filters" className="hidden" preserveAspectRatio="xMidYMid slice">
    <defs>
      <filter id="threshold">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
);

const MorphingText: React.FC<MorphingTextProps> = ({ texts, className }) => {
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

  const enabled = inView && !reduced

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative mx-auto h-16 w-full max-w-screen-md text-center font-sans font-bold leading-none whitespace-nowrap [filter:url(#threshold)_blur(0.6px)] text-3xl md:h-24 md:text-4xl lg:text-5xl",
        className,
      )}
    >
      <Texts texts={texts} enabled={enabled} />
      <SvgFilters />
    </div>
  )
}

export { MorphingText };


