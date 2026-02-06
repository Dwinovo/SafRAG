"use client";

import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";

interface GalleryHoverCarouselItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string;
}

export default function GalleryHoverCarousel({
  heading = "御典特色能力",
  demoUrl = "#",
  items = [
    {
      id: "item-1",
      title: "多层级访问管控",
      summary:
        "基于优先级的精细化权限模型，确保不同角色仅能触达被授权的知识与文档。",
      url: "#",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: "item-2",
      title: "可证明的安全审计",
      summary:
        "全链路操作日志与可追溯提示稿，支持合规审计与风险溯源，打造可信问答体验。",
      url: "#",
      image:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: "item-3",
      title: "动态检索与策略编排",
      summary:
        "自适应的检索与响应策略，让御典在复杂业务场景中保持高准确率与稳定输出。",
      url: "#",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop",
    }
  ],
}: {
  heading?: string;
  demoUrl?: string;
  items?: GalleryHoverCarouselItem[];
}) {
  return (
    <section className="pt-12 pb-12">
      <div className="container mx-auto px-6">
        <div className="mb-8 flex flex-col justify-between md:mb-14 md:flex-row md:items-end lg:mb-16">
          <div className="w-full">
            <h3 className="text-lg sm:text-xl lg:text-3xl font-medium text-gray-900 dark:text-white leading-relaxed">
              {heading}{" "}
              <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-3xl">
                {" "}
                精选御典在安全、合规与智能检索方面的能力展示，助力企业构建可信 RAG 解决方案。
              </span>
            </h3>
          </div>
          {/* 导航按钮放到 Carousel Provider 作用域内部，避免 context 错误 */}
        </div>

        <div className="w-full max-w-full">
          <Carousel
            className="relative w-full max-w-full"
            opts={{ align: "start", dragFree: true }}
          >
            <CarouselContent className="hide-scrollbar ml-0 flex w-full max-w-full gap-4 md:-ml-4">
              {items.map((item) => (
                <CarouselItem key={item.id} className="pl-0 md:basis-1/3 md:pl-4">
                  <Link href={item.url as any} className="group block relative w-full h-[300px] md:h-[350px]">
                    <Card className="overflow-hidden rounded-xl h-full w-full rounded-3xl">
                      {/* Image */}
                      <div className="relative h-full w-full transition-all duration-500 group-hover:h-1/2">
                        <Image
                          width={400}
                          height={300}
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover object-center"
                        />
                        {/* Fade overlay at bottom */}
                        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>

                      {/* Text Section */}
                      <div className="absolute bottom-0 left-0 w-full px-4 transition-all duration-500 group-hover:h-1/2 group-hover:flex flex-col justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100">
                        <h3 className="text-lg font-medium md:text-xl">{item.title}</h3>
                        <p className="text-muted-foreground text-sm md:text-base line-clamp-2">
                          {item.summary}
                        </p>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute bottom-2 right-2 border border-gray-200 dark:border-gray-800 hover:-rotate-45 transition-all duration-500 rounded-full mt-2 px-0 flex items-center gap-1 text-primary hover:text-primary/80"
                        >
                          <ArrowRight className="size-4" />
                        </Button>
                      </div>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
