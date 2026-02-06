"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Github, MessageCircle, Moon, Sun } from "lucide-react"

function Footerdemo() {
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">保持联系</h2>
            <p className="text-muted-foreground">
              御典致力于为企业提供安全、可靠、智能的RAG解决方案。
            </p>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">快速入口</h3>
            <nav className="space-y-2 text-sm">
              <a href="#" className="block transition-colors hover:text-primary">
                首页
              </a>
              <a href="#" className="block transition-colors hover:text-primary">
                关于御典
              </a>
              <a href="#" className="block transition-colors hover:text-primary">
                服务
              </a>
              <a href="#" className="block transition-colors hover:text-primary">
                产品
              </a>
              <a href="#" className="block transition-colors hover:text-primary">
                联系我们
              </a>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">联系我们</h3>
            <address className="space-y-2 text-sm not-italic">
              <p>xx大道 xx号</p>
              <p>xx市 · xx区</p>
              <p>电话：xxx-xxxx-xxxx</p>
              <p>邮箱：contact@yudian.ai</p>
            </address>
          </div>
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">关注我们</h3>
            <div className="mb-6 flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Github className="h-4 w-4" />
                      <span className="sr-only">GitHub</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>前往 GitHub 查看源代码</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <MessageCircle className="h-4 w-4" />
                      <span className="sr-only">微博</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>关注我们的微博</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
              />
              <Moon className="h-4 w-4" />
              <Label htmlFor="dark-mode" className="sr-only">
                切换深色模式
              </Label>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 御典. 保留所有权利。
          </p>
          <nav className="flex gap-4 text-sm">
            <a href="#" className="transition-colors hover:text-primary">
              隐私政策
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              服务条款
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Cookie 设置
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }

