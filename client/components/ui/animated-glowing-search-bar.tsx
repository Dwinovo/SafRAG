import * as React from "react";
import { ChevronDown, Check, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AnimatedGlowingSearchBarProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  levelOptions?: string[];
  selectedLevelName?: string | null;
  onLevelChange?: (level: string | null) => void;
};

const AnimatedGlowingSearchBar = ({
  value,
  onValueChange,
  onSubmit,
  placeholder = "Search...",
  className,
  levelOptions,
  selectedLevelName,
  onLevelChange,
}: AnimatedGlowingSearchBarProps) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className="absolute z-[-1] min-h-screen w-full" />
      <div id="poda" className="group relative flex items-center justify-center">
        <div className="absolute z-[-1] h-full w-full max-h-[56px] max-w-[320px] overflow-hidden rounded-xl blur-[3px] before:absolute before:z-[-2] before:h-[999px] before:w-[999px] before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[60deg] before:bg-[conic-gradient(#ffffff,#d6ccff_5%,#ffffff_35%,#ffffff_50%,#ffd9f4_70%,#ffffff_90%)] before:bg-no-repeat before:transition-all before:duration-[2000ms] group-focus-within:before:rotate-[420deg] group-focus-within:before:duration-[4000ms] group-hover:before:-rotate-[120deg]" />
        <div className="absolute z-[-1] h-full w-full max-h-[52px] max-w-[316px] overflow-hidden rounded-xl blur-[3px] before:absolute before:z-[-2] before:h-[600px] before:w-[600px] before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[82deg] before:bg-[conic-gradient(rgba(255,255,255,0),#d1c7ff,rgba(255,255,255,0)_12%,rgba(255,255,255,0)_50%,#ffe2f9,rgba(255,255,255,0)_68%)] before:bg-no-repeat before:transition-all before:duration-[2000ms] group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-[4000ms] group-hover:before:-rotate-[98deg]" />
        <div className="absolute z-[-1] h-full w-full max-h-[52px] max-w-[316px] overflow-hidden rounded-xl blur-[3px] before:absolute before:z-[-2] before:h-[600px] before:w-[600px] before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[82deg] before:bg-[conic-gradient(rgba(255,255,255,0),#d1c7ff,rgba(255,255,255,0)_12%,rgba(255,255,255,0)_50%,#ffe2f9,rgba(255,255,255,0)_68%)] before:bg-no-repeat before:transition-all before:duration-[2000ms] group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-[4000ms] group-hover:before:-rotate-[98deg]" />
        <div className="absolute z-[-1] h-full w-full max-h-[52px] max-w-[316px] overflow-hidden rounded-xl blur-[3px] before:absolute before:z-[-2] before:h-[600px] before:w-[600px] before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[82deg] before:bg-[conic-gradient(rgba(255,255,255,0),#d1c7ff,rgba(255,255,255,0)_12%,rgba(255,255,255,0)_50%,#ffe2f9,rgba(255,255,255,0)_68%)] before:bg-no-repeat before:transition-all before:duration-[2000ms] group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-[4000ms] group-hover:before:-rotate-[98deg]" />
        <div className="absolute z-[-1] h-full w-full max-h-[50px] max-w-[312px] overflow-hidden rounded-lg blur-[2px] before:absolute before:z-[-2] before:h-[600px] before:w-[600px] before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[83deg] before:bg-[conic-gradient(rgba(255,255,255,0),#ede9ff,rgba(255,255,255,0)_10%,rgba(255,255,255,0)_50%,#ffe5f6,rgba(255,255,255,0)_62%)] before:bg-no-repeat before:brightness-110 before:transition-all before:duration-[2000ms] group-focus-within:before:rotate-[443deg] group-focus-within:before:duration-[4000ms] group-hover:before:-rotate-[97deg]" />
        <div className="absolute z-[-1] h-full w-full max-h-[46px] max-w-[308px] overflow-hidden rounded-xl blur-[0.5px] before:absolute before:z-[-2] before:h-[600px] before:w-[600px] before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[70deg] before:bg-[conic-gradient(#f7f5ff,#d8cffd_12%,#f7f5ff_34%,#f7f5ff_50%,#ffddf2_70%,#f7f5ff_82%)] before:bg-no-repeat before:brightness-105 before:transition-all before:duration-[2000ms] group-focus-within:before:rotate-[430deg] group-focus-within:before:duration-[4000ms] group-hover:before:-rotate-[110deg]" />
        <div id="main" className="group relative">
          <input
            placeholder={placeholder}
            type="text"
            name="search"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "h-[40px] rounded-lg border border-neutral-200 bg-white pl-[44px] pr-3 text-sm text-black placeholder-gray-500 shadow-sm focus:border-neutral-400 focus:outline-none",
              levelOptions && levelOptions.length > 0 ? "pr-[120px] w-[340px]" : "w-[300px]",
            )}
          />
          <div id="input-mask" className="pointer-events-none absolute left-[56px] top-[14px] h-[18px] w-[80px] bg-gradient-to-r from-transparent to-white transition-opacity duration-300 group-focus-within:opacity-0" />
          <div id="pink-mask" className="pointer-events-none absolute left-[4px] top-[8px] h-[18px] w-[24px] rounded-full bg-[#fcd0f2] opacity-70 blur-2xl transition-opacity duration-[2000ms] group-hover:opacity-0" />
          <div id="search-icon" className="absolute left-4 top-[11px] text-neutral-700">
            <Search className="h-4 w-4" strokeWidth={2} />
          </div>
          {levelOptions && levelOptions.length > 0 && onLevelChange ? (
            <div className="absolute inset-y-0 right-2 flex items-center">
              <LevelDropdown
                options={levelOptions}
                selected={selectedLevelName ?? null}
                onChange={onLevelChange}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AnimatedGlowingSearchBar;

type LevelDropdownProps = {
  options: string[];
  selected: string | null;
  onChange: (level: string | null) => void;
};

const LevelDropdown = ({ options, selected, onChange }: LevelDropdownProps) => {
  const uniqueOptions = React.useMemo(
    () => Array.from(new Set(options.filter((option) => option && option.trim().length > 0))),
    [options],
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="flex w-[142px] items-center justify-center gap-1 rounded-full px-3 text-xs font-medium text-neutral-700"
        >
          <span className="max-w-[90px] truncate text-center">{selected || "全部等级"}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[142px] min-w-0" sideOffset={4}>
        <DropdownMenuItem onSelect={() => onChange(null)} className="flex items-center gap-2 text-sm">
          <span>全部等级</span>
          {!selected && <Check className="ml-auto h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        {uniqueOptions.length > 0 && <DropdownMenuSeparator />}
        {uniqueOptions.map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={() => onChange(option)}
            className="flex items-center gap-2 text-sm"
          >
            <span className="truncate">{option}</span>
            {selected === option && <Check className="ml-auto h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
