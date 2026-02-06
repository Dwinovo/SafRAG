"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Gallery6Item {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string;
}

export interface Gallery6Props {
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  demoUrl?: string;
  avatarUrl?: string | null;
  avatarFallback?: string | null;
  items?: Gallery6Item[];
}

const getAvatarFallback = (name?: string | null) => {
  if (!name) return "用户";
  const trimmed = name.trim();
  if (!trimmed) return "用户";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    const chars = Array.from(parts[0]);
    if (chars.length === 0) return "用户";
    if (chars[0].match(/[\p{Script=Han}]/u)) {
      return chars[0];
    }
    if (chars.length === 1) {
      return chars[0].toUpperCase();
    }
    return `${chars[0]}${chars[1]}`.toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Gallery6 = ({
  heading = "Gallery",
  subheading,
  ctaLabel = "Book a demo",
  demoUrl = "#",
  avatarUrl,
  avatarFallback,
  items = [],
}: Gallery6Props) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (carouselApi) {
      carouselApi.reInit();
    }
  }, [carouselApi, items]);

  const effectiveItems = items.length
    ? items
    : [
        {
          id: "item-1",
          title: "Build Modern UIs",
          summary:
            "Create stunning user interfaces with our comprehensive design system.",
          url: "#",
          image:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        },
        {
          id: "item-2",
          title: "Computer Vision Technology",
          summary:
            "Powerful image recognition and processing capabilities that allow AI systems to analyze, understand, and interpret visual information from the world.",
          url: "#",
          image:
            "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=1200&q=80",
        },
        {
          id: "item-3",
          title: "Machine Learning Automation",
          summary:
            "Self-improving algorithms that learn from data patterns to automate complex tasks and make intelligent decisions with minimal human intervention.",
          url: "#",
          image:
            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        },
      ];

  return (
    <section className="py-12">
      <div className="container">
        <div className="mb-8 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end lg:mb-16">
          <div className="flex items-start gap-4">
            {heading ? (
              <Avatar className="h-12 w-12 border border-primary/30">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={heading} />
                ) : null}
                <AvatarFallback>{getAvatarFallback(avatarFallback || heading)}</AvatarFallback>
              </Avatar>
            ) : null}
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl">{heading}</h2>
              {subheading ? (
                <p className="text-sm text-muted-foreground md:text-base">{subheading}</p>
              ) : null}
              {demoUrl ? (
                <a
                  href={demoUrl}
                  className="group flex items-center gap-1 text-sm font-medium md:text-base"
                >
                  {ctaLabel}
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-start gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollPrev();
              }}
              disabled={!canScrollPrev}
              className="disabled:pointer-events-auto"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollNext();
              }}
              disabled={!canScrollNext}
              className="disabled:pointer-events-auto"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            breakpoints: {
              "(max-width: 768px)": {
                dragFree: true,
                align: "start",
              },
            },
            align: "start",
          }}
          className="relative left-[-1rem]"
        >
          <CarouselContent className="-mr-4 ml-8 flex gap-4 2xl:ml-[max(8rem,calc(50vw-700px+1rem))] 2xl:mr-[max(0rem,calc(50vw-700px-1rem))]">
            {effectiveItems.map((item) => (
              <CarouselItem key={item.id} className="pl-4 md:max-w-[452px]">
                <a
                  href={item.url}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-transparent bg-white shadow-sm transition hover:border-primary/40 hover:shadow-lg"
                >
                  <div>
                    <div className="flex aspect-[3/2] overflow-hidden rounded-t-2xl">
                      <div className="relative h-full w-full origin-bottom transition duration-300 group-hover:scale-105">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover object-center"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 p-6">
                    <div className="line-clamp-2 break-words text-lg font-semibold md:text-xl lg:text-2xl">
                      {item.title}
                    </div>
                    <div className="line-clamp-3 text-sm text-muted-foreground md:text-base">
                      {item.summary}
                    </div>
                    <div className="flex items-center text-sm text-primary">
                      查看详情
                      <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export { Gallery6 };

