"use client"
import { motion } from "framer-motion"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { GlowingEffectDemo } from "@/components/ui/glowing-effect-demo"
import GalleryHoverCarousel from "@/components/ui/gallery-hover-carousel"
import { GradualSpacing } from "@/components/ui/gradual-spacing"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { Footerdemo } from "@/components/ui/footer-section"
import { NavHeroHeader } from "@/components/ui/nav-hero-header"
// removed LandingAccordionItem (image accordion)

export default function HomePage() {

  return (
    <AuroraBackground className="items-stretch justify-start">
      <NavHeroHeader />
      <main className="flex flex-1 items-center justify-center p-0 z-10 pt-24 md:pt-32">
        <motion.div
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            className="relative flex flex-col gap-3 items-center justify-center px-4"
          >
            <GradualSpacing
              className="text-5xl md:text-7xl font-bold text-black dark:text-white"
              text="御典"
            />
            <div className="pt-2 md:pt-3 text-lg md:text-2xl tracking-[0.2em] text-black dark:text-white pb-2 md:pb-3">
              安全 · 智能 · 高效
            </div>
            <p className="max-w-2xl text-center text-base md:text-lg text-neutral-600 dark:text-neutral-200 pb-4 md:pb-6">
              御典是一套可证明安全的访问控制 RAG 系统，针对企业级场景构建层级权限体系，
              让每一次调用都能追溯来源、确保可信，帮助团队放心地管理与查询核心知识。
            </p>
            <div className="-mt-2 md:-mt-3 flex items-center gap-3">
              <a href="/chat">
                <InteractiveHoverButton text="立即体验" colorMode="darkToLight" />
              </a>
              <InteractiveHoverButton text="了解御典" colorMode="lightToDark" />
            </div>
            {/* image accordion removed */}
            <div className="w-full max-w-6xl">
              <GalleryHoverCarousel />
            </div>
            <div className="w-full max-w-6xl">
              <GlowingEffectDemo />
            </div>
          </motion.div>
      </main>
      <Footerdemo />
    </AuroraBackground>
  )
}
