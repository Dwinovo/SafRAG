"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Ellipsis } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Conversation {
  id: number
  title: string
}

interface AnimatedConversationListProps {
  conversations: Conversation[]
  selectedId: number | null
  onSelect: (id: number) => void
  onRename?: (id: number) => void
  onDelete?: (id: number) => void
  onMenuOpen?: () => void
  onMenuClose?: () => void
}

export default function AnimatedConversationList({
  conversations,
  selectedId,
  onSelect,
  onRename,
  onDelete,
  onMenuOpen,
  onMenuClose,
}: AnimatedConversationListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<number | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  const getGliderTransform = () => {
    const index = conversations.findIndex((conv) => conv.id === selectedId)
    if (index === -1) return null
    return `translateY(${index * 100}%)`
  }

  const isAnySelected = selectedId !== null && conversations.some((conv) => conv.id === selectedId)

  const closeMenu = () => {
    if (openMenuId !== null) {
      setOpenMenuId(null)
      onMenuClose?.()
    }
  }

  const handleDeleteClick = (id: number) => {
    closeMenu()
    setConversationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (conversationToDelete !== null && onDelete) {
      onDelete(conversationToDelete)
    }
    setDeleteDialogOpen(false)
    setConversationToDelete(null)
    closeMenu()
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setConversationToDelete(null)
    closeMenu()
  }

  if (conversations.length === 0) {
    return <div className="text-xs text-neutral-400 px-2 py-1">暂无会话</div>
  }

  return (
    <div className="relative flex flex-col pl-2">
      {conversations.map((conversation, index) => (
        <div key={conversation.id} className="relative z-20 py-1">
          <input
            id={`conversation-${conversation.id}`}
            name="conversation-radio"
            type="radio"
            value={conversation.id}
            checked={selectedId === conversation.id}
            onChange={() => onSelect(conversation.id)}
            className="absolute w-full h-full m-0 opacity-0 cursor-pointer z-30 appearance-none"
          />
          <div className="flex items-center justify-between gap-2 pr-2">
            <label
              htmlFor={`conversation-${conversation.id}`}
              className={`cursor-pointer flex-1 text-sm py-2 pl-1 pr-2 block transition-all duration-300 ease-in-out truncate ${
                selectedId === conversation.id
                  ? "text-black dark:text-white font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
              }`}
              title={conversation.title}
            >
              {conversation.title || `会话 #${conversation.id}`}
            </label>
            
            {(onRename || onDelete) && (
              <DropdownMenu
                open={openMenuId === conversation.id}
                onOpenChange={(open) => {
                  if (open) {
                    setOpenMenuId(conversation.id)
                    onMenuOpen?.()
                  } else {
                    if (openMenuId === conversation.id) {
                      setOpenMenuId(null)
                    }
                    onMenuClose?.()
                  }
                }}
              >
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 rounded-full shadow-none z-40 relative"
                    aria-label="Open menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={4} className="min-w-[160px] py-2">
                  {onRename && (
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault()
                        closeMenu()
                        onRename(conversation.id)
                      }}
                    >
                      编辑
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault()
                        handleDeleteClick(conversation.id)
                      }}
                    >
                      删除
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      ))}

      {/* 动画滑块 */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 dark:via-neutral-700 to-transparent pointer-events-none">
        {isAnySelected && (
          <div
            className="relative w-full bg-gradient-to-b from-transparent via-black dark:via-white to-transparent transition-transform duration-500 ease-[cubic-bezier(0.37,1.95,0.66,0.56)] pointer-events-none"
            style={{
              height: `${100 / Math.max(conversations.length, 1)}%`,
              transform: getGliderTransform() || undefined,
            }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 h-3/5 w-[300%] bg-black dark:bg-white blur-[10px]" />
            <div className="absolute left-0 h-full w-36 bg-gradient-to-r from-black/10 dark:from-white/10 to-transparent" />
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除会话？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久删除该会话及其所有聊天记录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
