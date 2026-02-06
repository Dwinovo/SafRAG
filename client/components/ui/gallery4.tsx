"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Gallery4Item {
  id: string;
  title: string;
  description?: string | null;
  href: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Gallery4Props {
  avatarUrl?: string | null;
  avatarFallback?: string | null;
  userName: string;
  userLevel?: string | null;
  summary?: string | null;
  items: Gallery4Item[];
  onNavigate?: (item: Gallery4Item) => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return "暂无时间信息";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getAvatarFallback = (name?: string | null, fallback?: string | null) => {
  if (fallback?.trim()) {
    return fallback.trim().slice(0, 2).toUpperCase();
  }
  if (!name) return "用户";
  const trimmed = name.trim();
  if (!trimmed) return "用户";
  const chars = Array.from(trimmed);
  if (chars.length >= 2) {
    return `${chars[0]}${chars[1]}`.toUpperCase();
  }
  return chars[0].toUpperCase();
};

const truncateText = (value?: string | null, maxLength = 30) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}…`;
};

export function Gallery4({
  avatarUrl,
  avatarFallback,
  userName,
  userLevel,
  summary,
  items,
  onNavigate,
}: Gallery4Props) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    carouselApi.reInit();
  }, [carouselApi, items]);

  return (
    <section className="py-4">
      <div className="px-4 md:px-8">
        <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:gap-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 shrink-0 border border-primary/20">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-base font-semibold uppercase text-primary">
                {getAvatarFallback(userName, avatarFallback)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-neutral-900 md:text-2xl">
                {userName || "未知用户"}
              </h2>
              <p className="text-sm text-neutral-500">
                {userLevel?.trim() || "权限信息暂无"}
              </p>
              {summary ? (
                <p className="text-xs text-neutral-400">{summary}</p>
              ) : null}
            </div>
          </div>
          {items.length > 1 ? (
            <div className="flex w-full items-center justify-center gap-2 md:w-auto md:ml-auto md:justify-end md:pr-16">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => carouselApi?.scrollPrev()}
                disabled={!canScrollPrev}
                className="disabled:pointer-events-auto"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => carouselApi?.scrollNext()}
                disabled={!canScrollNext}
                className="disabled:pointer-events-auto"
              >
                <ArrowRight className="size-5" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            align: "start",
            dragFree: true,
            slidesToScroll: 1,
          }}
          className="px-4 md:px-8"
        >
          <CarouselContent className="ml-0 gap-5 md:-ml-6">
            {items.length ? (
              items.map((item) => (
                <CarouselItem
                  key={item.id}
                  className="basis-[260px] pl-0 md:basis-[300px] md:pl-6"
                >
                  <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => onNavigate?.(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onNavigate?.(item);
                      }
                    }}
                    className="flex h-full min-h-[240px] cursor-pointer flex-col justify-between rounded-2xl border border-primary/20 bg-white shadow-sm transition hover:border-primary hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60"
                  >
                    <CardHeader className="space-y-2 min-h-[120px]">
                      <CardTitle className="leading-relaxed">
                        {item.title}
                      </CardTitle>
                      {item.description ? (
                        <CardDescription className="text-sm text-neutral-600 line-clamp-2">
                          {truncateText(item.description)}
                        </CardDescription>
                      ) : (
                        <CardDescription className="text-sm text-neutral-500">
                          暂无描述
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-neutral-500">
                        最近更新：{formatDate(item.updatedAt ?? item.createdAt)}
                      </p>
                    </CardContent>
                    <CardFooter className="justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          onNavigate?.(item);
                        }}
                        className="pointer-events-auto"
                      >
                        查看详情
                      </Button>
                    </CardFooter>
                  </Card>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem className="pl-0 md:pl-6">
                <Card className="flex h-full min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
                  该用户尚未创建共享的知识库。
                </Card>
              </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>

      </div>
    </section>
  );
}
