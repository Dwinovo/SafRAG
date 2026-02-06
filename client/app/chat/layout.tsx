"use client"
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar"
import { Home, Database, Plus } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import AnimatedConversationList from "@/components/ui/animated-conversation-list"
import { useRouter, usePathname } from "next/navigation"
import { ChatProvider, useChatContext } from "./chat-context"
import UserProfileDemo from "@/components/ui/user-profile-demo"
import { useState } from "react"
import { axiosInstance } from "@/lib/axios"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </ChatProvider>
  )
}

function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const { conversations, loading, error, removeConversation } = useChatContext()
  const pathname = usePathname()

  // 从路径中提取当前激活的会话ID
  const match = pathname.match(/^\/chat\/(\d+)$/)
  const activeId = match && match[1] ? Number(match[1]) : null

  const links = [
    { label: "主页", href: "/", icon: <Home className="h-[25px] w-[25px]" /> },
    { label: "新建对话", href: "/chat", icon: <Plus className="h-[25px] w-[25px]" /> },
    { label: "知识库", href: "/rag", icon: <Database className="h-[25px] w-[25px]" /> },
  ]

  return (
    <div className={cn("relative w-full flex-1 min-h-svh bg-gray-100 dark:bg-neutral-800")}> 
      {/* 固定定位的侧边栏 */}
      <Sidebar>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (<SidebarLink key={idx} link={link} />))}
            </div>
            <ConversationsSection
              items={conversations}
              activeId={activeId}
              onRemove={removeConversation}
              loading={loading}
              error={error}
            />
          </div>
          <div className="flex justify-start">
            <UserProfileDemo />
          </div>
        </SidebarBody>
      </Sidebar>
      {/* 内容区域占满整个屏幕 */}
      <div className="w-full min-h-svh">
        {children}
      </div>
    </div>
  )
}

const ConversationsSection = ({
  items,
  activeId,
  onRemove,
  loading,
  error,
}: {
  items: Array<{ id: number; title: string }>
  activeId: number | null
  onRemove: (id: number) => void
  loading: boolean
  error: string | null
}) => {
  const { open, setLockOpen } = useSidebar()
  const router = useRouter()
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameConversationId, setRenameConversationId] = useState<number | null>(null)
  const [renameTitle, setRenameTitle] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)

  const handleRename = async (conversationId: number, currentTitle: string) => {
    setRenameConversationId(conversationId)
    setRenameTitle(currentTitle)
    setRenameDialogOpen(true)
    setLockOpen(false)
  }

  const handleRenameSubmit = async () => {
    if (!renameConversationId || !renameTitle.trim()) return

    try {
      setIsRenaming(true)
      await axiosInstance.put(`/conversation/${renameConversationId}`, {
        title: renameTitle.trim()
      })
      // 这里需要刷新会话列表，暂时通过页面刷新实现
      window.location.reload()
    } catch (error) {
      console.error('重命名失败:', error)
    } finally {
      setIsRenaming(false)
      setRenameDialogOpen(false)
      setRenameConversationId(null)
      setRenameTitle("")
    }
  }

  return (
    <>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, delay: 0.1 }}
          >
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 px-2 whitespace-nowrap overflow-hidden mb-4">近期对话</h2>
            {loading ? (
              <div className="text-xs text-neutral-400 px-2 py-1">加载中...</div>
            ) : error ? (
              <div className="text-xs text-red-500 px-2 py-1">{error}</div>
            ) : (
              <AnimatedConversationList
                conversations={items}
                selectedId={activeId}
                onSelect={(id) => router.push(`/chat/${id}` as any)}
                onRename={(id) => {
                  const conversation = items.find(item => item.id === id)
                  if (conversation) {
                    handleRename(id, conversation.title)
                  }
                }}
                onDelete={async (id) => {
                  try {
                    const { axiosInstance } = await import("@/lib/axios")
                    await axiosInstance.delete(`/conversation/${id}`)
                    onRemove(id)
                    if (activeId === id) {
                      router.push('/chat' as any)
                    }
                  } catch (e) {}
                  // 删除完成后解锁
                  setLockOpen(false)
                }}
                onMenuOpen={() => setLockOpen(true)}
                onMenuClose={() => setLockOpen(false)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 重命名对话框 */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名对话</DialogTitle>
            <DialogDescription>
              为对话输入新的标题
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder="请输入对话标题"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
              disabled={isRenaming}
            >
              取消
            </Button>
            <Button
              onClick={handleRenameSubmit}
              disabled={!renameTitle.trim() || isRenaming}
            >
              {isRenaming ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
