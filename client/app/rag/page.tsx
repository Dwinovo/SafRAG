"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import StackingCard, { type StackingCardProps } from "@/components/ui/stacking-card"
import { useKnowledgeBases } from "./layout"

const COLOR_PALETTE = ["#5196fd", "#8f89ff", "#13006c", "#ed649e", "#fd521a"]
const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1605106702842-01a887a31122?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605106250963-ffda6d2a4b32?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1605106901227-991bd663255c?w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605106715994-18d3fecffb98?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1506792006437-256b665541e2?w=500&auto=format&fit=crop",
]

export default function Page() {
  const { knowledgeBases, loading, error, openCreateDialog } = useKnowledgeBases()

  if (loading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 text-neutral-500 dark:text-neutral-400">
        <p>知识库加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 p-6 text-neutral-500 dark:text-neutral-400">
        <p className="text-center">获取知识库列表时出现问题：{error}</p>
        <Button onClick={openCreateDialog}>新建知识库</Button>
      </div>
    )
  }

  const projects = useMemo<StackingCardProps["projects"]>(() => {
    return knowledgeBases.map((kb, index) => ({
      title: kb.name,
      description: kb.description?.trim() || "这个知识库还没有描述，快去补充一些信息吧！",
      link: IMAGE_POOL[index % IMAGE_POOL.length],
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
      href: kb.id ? `/rag/${kb.id}` : undefined,
    }))
  }, [knowledgeBases])

  const hasKnowledgeBases = projects.length > 0

  return (
    <StackingCard
      projects={projects}
      renderBeforeCards={
        <div className="flex flex-col items-center gap-3 pb-8">
          <InteractiveHoverButton
            text="新建数据库"
            onClick={openCreateDialog}
            className="w-48 sm:w-56"
          />
          {!hasKnowledgeBases ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              暂无知识库，点击上方按钮创建一个吧。
            </p>
          ) : null}
        </div>
      }
    />
  )
}
