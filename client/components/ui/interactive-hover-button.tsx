import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorMode = "darkToLight" | "lightToDark";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  colorMode?: ColorMode;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, colorMode = "darkToLight", ...props }, ref) => {
  const isDarkToLight = colorMode === "darkToLight";
  const baseClasses = isDarkToLight
    ? "border-transparent bg-black text-white hover:border-white hover:bg-white"
    : "border-white bg-white text-black hover:border-black hover:bg-black";
  const hoverTextClasses = isDarkToLight ? "text-black" : "text-white";
  const dotBaseColor = isDarkToLight ? "bg-white" : "bg-black";
  const dotHoverColor = isDarkToLight ? "group-hover:bg-white" : "group-hover:bg-black";
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-32 cursor-pointer overflow-hidden rounded-full border p-2 text-center font-semibold transition-colors duration-300",
        baseClasses,
        className,
      )}
      {...props}
    >
      <span className="relative z-10 inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {text}
      </span>
      <div className={cn(
        "absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100",
        hoverTextClasses
      )}>
        <span>{text}</span>
        <ArrowRight />
      </div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-[10%] top-1/2 -translate-y-1/2 z-0 h-2 w-2 rounded-[inherit] transition-all duration-300 group-hover:-inset-px group-hover:translate-y-0 group-hover:h-auto group-hover:w-auto",
          dotBaseColor,
          dotHoverColor
        )}
      />
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };


