"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { axiosInstance } from "@/lib/axios"

type Conversation = {
  id: number
  userId: number
  title: string
  createdAt?: string
  updatedAt?: string
}

type ChatContextType = {
  conversations: Conversation[]
  loading: boolean
  error: string | null
  refreshConversations: () => Promise<void>
  addConversation: (conversation: Conversation) => void
  removeConversation: (id: number) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshConversations = async () => {
    try {
      const res = await axiosInstance.get("/conversation/list")
      const data = res?.data
      if (data && data.code === 200 && Array.isArray(data.data)) {
        setError(null)
        setConversations(data.data as Conversation[])
      } else {
        setError(data?.message || "加载失败")
      }
    } catch (e: any) {
      setError(e?.message || "网络异常")
    } finally {
      setLoading(false)
    }
  }

  const addConversation = (conversation: Conversation) => {
    setConversations((prev) => [conversation, ...prev])
  }

  const removeConversation = (id: number) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
  }

  useEffect(() => {
    refreshConversations()
  }, [])

  return (
    <ChatContext.Provider
      value={{
        conversations,
        loading,
        error,
        refreshConversations,
        addConversation,
        removeConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider")
  }
  return context
}

