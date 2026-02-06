"use client"
import { FormEvent, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar"
import { Home, MessageCircle, Database } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import AnimatedConversationList from "@/components/ui/animated-conversation-list"
import { axiosInstance } from "@/lib/axios"
import { Button } from "@/components/ui/button"
import UserProfileDemo from "@/components/ui/user-profile-demo"
import { useAppDispatch, useAppSelector, setUserProfile } from "@/lib/store"
import { getCurrentUserId } from "@/lib/auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePathname, useRouter } from "next/navigation"

export default function RagLayout({ children }: { children: React.ReactNode }) {
  return (
    <RagLayoutContent>{children}</RagLayoutContent>
  )
}

type KnowledgeBaseSummary = { id: number; name: string; description?: string | null; createdAt?: string | null; updatedAt?: string | null }

interface KnowledgeBaseContextValue {
  knowledgeBases: KnowledgeBaseSummary[]
  loading: boolean
  error: string | null
  openCreateDialog: () => void
}

const KnowledgeBaseContext = createContext<KnowledgeBaseContextValue | undefined>(undefined)

export function useKnowledgeBases() {
  const context = useContext(KnowledgeBaseContext)
  if (!context) {
    throw new Error("useKnowledgeBases must be used within RagLayout")
  }
  return context
}

function RagLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector(state => state.auth)
  const profileFetchedRef = useRef(false)
  const [kbs, setKbs] = useState<KnowledgeBaseSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<{ name: string; description: string }>({
    name: "",
    description: "",
  })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ id: number | null; name: string; description: string }>({
    id: null,
    name: "",
    description: "",
  })

  const selectedKnowledgeBaseId = useMemo(() => {
    if (!pathname) return null
    const match = pathname.match(/^\/rag\/(\d+)/)
    if (!match) return null
    const id = Number.parseInt(match[1], 10)
    return Number.isFinite(id) ? id : null
  }, [pathname])

  useEffect(() => {
    if (!isAuthenticated) {
      profileFetchedRef.current = false
      return
    }
    if (profileFetchedRef.current) return
    if (user?.avatarUrl && user.avatarUrl.trim().length > 0) {
      profileFetchedRef.current = true
      return
    }
    const userId = getCurrentUserId()
    if (!userId) return
    profileFetchedRef.current = true
    ;(async () => {
      try {
        const res = await axiosInstance.get(`/user/${userId}`)
        const { code, data } = res.data ?? {}
        if (code === 200 && data) {
          dispatch(setUserProfile({ username: data.username, avatarUrl: data.avatarUrl }))
        } else {
          profileFetchedRef.current = false
        }
      } catch {
        profileFetchedRef.current = false
      }
    })()
  }, [isAuthenticated, user?.avatarUrl, dispatch])

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/knowledge-base/list")
        const data = res?.data
        if (data && data.code === 200 && Array.isArray(data.data)) {
          const sorted = [...data.data].sort((a: any, b: any) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
            if (timeA === timeB) return (a.id ?? 0) - (b.id ?? 0)
            return timeA - timeB
          })
          setKbs(sorted)
          setError(null)
        } else {
          setError(data?.message || "加载失败")
        }
      } catch (e: any) {
        setError(e?.message || "网络异常")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const openCreateDialog = useCallback(() => {
    setCreateLoading(false)
    setCreateError(null)
    setCreateForm({ name: "", description: "" })
    setCreateDialogOpen(true)
  }, [])

  const handleDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      setCreateLoading(false)
      setCreateError(null)
      setCreateForm({ name: "", description: "" })
    }
  }

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = createForm.name.trim()
    const trimmedDescription = createForm.description.trim()
    if (!trimmedName) {
      setCreateError("请填写知识库名称")
      return
    }
    setCreateLoading(true)
    try {
      const res = await axiosInstance.post("/knowledge-base/create", {
        name: trimmedName,
        description: trimmedDescription || undefined,
      })
      const data = res?.data
      if (data && data.code === 200 && data.data) {
        const { id, name, description, createdAt } = data.data as { id: number; name: string; description?: string | null; createdAt?: string }
        setKbs(prev => {
          const withoutDuplicate = prev.filter(item => item.id !== id)
          const next = [{ id, name, description, createdAt: createdAt ?? new Date().toISOString() }, ...withoutDuplicate]
          return next.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
            if (timeA === timeB) return (a.id ?? 0) - (b.id ?? 0)
            return timeA - timeB
          })
        })
        handleDialogOpenChange(false)
      } else {
        setCreateError(data?.message || "创建失败")
      }
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || "网络异常"
      setCreateError(message)
    } finally {
      setCreateLoading(false)
    }
  }

  const links = [
    { label: "主页", href: "/", icon: <Home className="h-[25px] w-[25px]" /> },
    { label: "我的知识库", href: "/rag", icon: <Database className="h-[25px] w-[25px]" /> },
    { label: "全部知识库", href: "/allrag", icon: <Database className="h-[25px] w-[25px]" /> },
    { label: "返回对话", href: "/chat", icon: <MessageCircle className="h-[25px] w-[25px]" /> },
  ]

  const handleDeleteKnowledgeBase = useCallback(async (id: number) => {
    try {
      await axiosInstance.delete(`/knowledge-base/${id}`)
      setKbs(prev => prev.filter(item => item.id !== id))
      setError(null)
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || "删除失败"
      setError(message)
      throw e
    }
  }, [setKbs, setError])

  const resetEditState = useCallback(() => {
    setEditDialogOpen(false)
    setEditLoading(false)
    setEditError(null)
    setEditForm({ id: null, name: "", description: "" })
  }, [])

  const handleEditDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetEditState()
    } else {
      setEditDialogOpen(true)
    }
  }

  const handleStartEditKnowledgeBase = useCallback(async (id: number) => {
    setEditDialogOpen(true)
    setEditLoading(true)
    setEditError(null)
    setEditForm({ id, name: "", description: "" })
    try {
      const res = await axiosInstance.get(`/knowledge-base/${id}`)
      const data = res?.data
      if (data && data.code === 200 && data.data) {
        const detail = data.data as { id: number; name?: string | null; description?: string | null }
        setEditForm({
          id: detail.id,
          name: detail.name ?? "",
          description: detail.description ?? "",
        })
      } else {
        setEditError(data?.message || "加载失败")
      }
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || "加载失败"
      setEditError(message)
    } finally {
      setEditLoading(false)
    }
  }, [])

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editForm.id) return
    const trimmedName = editForm.name.trim()
    const trimmedDescription = editForm.description.trim()
    if (!trimmedName) {
      setEditError("请填写知识库名称")
      return
    }
    setEditLoading(true)
    try {
      await axiosInstance.put(`/knowledge-base/${editForm.id}`, {
        name: trimmedName,
        description: trimmedDescription || undefined,
      })
      setKbs(prev => prev.map(k => k.id === editForm.id ? { ...k, name: trimmedName, description: trimmedDescription } : k))
      setError(null)
      resetEditState()
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || "更新失败"
      setEditError(message)
    } finally {
      setEditLoading(false)
    }
  }

  const contextValue = useMemo(() => ({
    knowledgeBases: kbs,
    loading,
    error,
    openCreateDialog,
  }), [kbs, loading, error, openCreateDialog])

  return (
    <div className={cn("relative w-full flex-1 min-h-svh bg-gray-100 dark:bg-neutral-800")}> 
      <Sidebar>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (<SidebarLink key={idx} link={link} />))}
            </div>
            <KnowledgeBasesSection
              items={kbs.map(k => ({ id: k.id, title: k.name }))}
              loading={loading}
              error={error}
              selectedId={selectedKnowledgeBaseId}
              onSelect={id => router.push(`/rag/${id}`)}
              onDelete={handleDeleteKnowledgeBase}
              onEdit={handleStartEditKnowledgeBase}
            />
          </div>
          <div className="flex justify-start">
            <UserProfileDemo />
          </div>
        </SidebarBody>
      </Sidebar>
      <KnowledgeBaseContext.Provider value={contextValue}>
        <div className="w-full min-h-svh">
          {children}
        </div>
      </KnowledgeBaseContext.Provider>
      <Dialog open={createDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建知识库</DialogTitle>
            <DialogDescription>填写名称和描述后，我们会为你创建一个新的知识库。</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateSubmit}>
            <div className="space-y-2">
              <Label htmlFor="kb-name">知识库名称</Label>
              <Input
                id="kb-name"
                autoFocus
                placeholder="例如：市场运营资料库"
                value={createForm.name}
                onChange={event => setCreateForm(prev => ({ ...prev, name: event.target.value }))}
                disabled={createLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kb-description">描述</Label>
              <Textarea
                id="kb-description"
                placeholder="简单介绍这个知识库的用途，方便后续识别。"
                value={createForm.description}
                onChange={event => setCreateForm(prev => ({ ...prev, description: event.target.value }))}
                disabled={createLoading}
              />
            </div>
            {createError && <p className="text-sm text-red-500">{createError}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
                disabled={createLoading}
              >
                取消
              </Button>
              <Button type="submit" disabled={createLoading || !createForm.name.trim()}>
                {createLoading ? "创建中..." : "创建"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={editDialogOpen} onOpenChange={handleEditDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑知识库</DialogTitle>
            <DialogDescription>修改名称或描述后保存更改。</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditSubmit}>
            <div className="space-y-2">
              <Label htmlFor="kb-edit-name">知识库名称</Label>
              <Input
                id="kb-edit-name"
                value={editForm.name}
                onChange={event => setEditForm(prev => ({ ...prev, name: event.target.value }))}
                disabled={editLoading}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kb-edit-description">描述</Label>
              <Textarea
                id="kb-edit-description"
                value={editForm.description}
                onChange={event => setEditForm(prev => ({ ...prev, description: event.target.value }))}
                disabled={editLoading}
              />
            </div>
            {editError && <p className="text-sm text-red-500">{editError}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleEditDialogOpenChange(false)}
                disabled={editLoading}
              >
                取消
              </Button>
              <Button type="submit" disabled={editLoading || !editForm.name.trim()}>
                {editLoading ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function KnowledgeBasesSection({
  items,
  loading,
  error,
  selectedId,
  onSelect,
  onDelete,
  onEdit,
}: {
  items: Array<{ id: number; title: string }>
  loading: boolean
  error: string | null
  selectedId: number | null
  onSelect: (id: number) => void
  onDelete?: (id: number) => Promise<void>
  onEdit?: (id: number) => void
}) {
  const { open, setLockOpen } = useSidebar()

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 px-2 whitespace-nowrap overflow-hidden mb-4">你的知识库</h2>
          {loading ? (
            <div className="text-xs text-neutral-400 px-2 py-1">加载中...</div>
          ) : error ? (
            <div className="text-xs text-red-500 px-2 py-1">{error}</div>
          ) : (
            <AnimatedConversationList
              conversations={items}
              selectedId={selectedId}
              onSelect={(id) => {
                onSelect(id)
              }}
              onRename={(id) => {
                onEdit?.(id)
                setLockOpen(false)
              }}
              onDelete={async (id) => {
                try {
                  await onDelete?.(id)
                } catch (e: any) {
                  console.error("删除知识库失败", e?.message || e)
                } finally {
                  setLockOpen(false)
                }
              }}
              onMenuOpen={() => setLockOpen(true)}
              onMenuClose={() => {
                setLockOpen(false)
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
