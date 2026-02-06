"use client"
import { PromptBox } from "@/components/ui/knowledge-prompt-box"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useEffect, useState, useRef } from "react"
import { axiosInstance } from "@/lib/axios"
import { useParams, useRouter } from "next/navigation"
// 移除气泡组件，使用简单渲染
import { CopyIcon, RefreshCcwIcon, ShareIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
// 移除动作按钮组件
import { useLLMOutput, throttleBasic } from "@llm-ui/react"
import { MessageLoading } from "@/components/ui/message-loading"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id ? Number(params.id) : null
  const [messages, setMessages] = useState<MessageType[]>([])
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [streaming, setStreaming] = useState<boolean>(false)
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null)
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8080` : '')
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const isStartingStreamRef = useRef<boolean>(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  // 已移除聊天动作按钮

  // 加载当前会话的消息
  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      return
    }
    let mounted = true
    setMessagesLoading(true)
    ;(async () => {
      try {
        const res = await axiosInstance.get(`/conversation/${conversationId}`)
        const data = res?.data
        if (data && data.code === 200 && Array.isArray(data.data)) {
          if (mounted) {
            setMessagesError(null)
            setMessages(data.data as MessageType[])
          }
        } else if (mounted) {
          setMessagesError(data?.message || "加载消息失败")
        }
      } catch (e: any) {
        if (mounted) setMessagesError(e?.message || "网络异常")
      } finally {
        if (mounted) setMessagesLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [conversationId])

  // 新消息到来或流式更新时，自动滚动到底部
  useEffect(() => {
    try { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }); } catch {}
  }, [messages, streaming])

  // llm-ui: throttle 与 fallbackBlock（最小实现，直接按文本显示）
  const throttle = throttleBasic({
    readAheadChars: 8,
    targetBufferChars: 6,
    adjustPercentage: 0.3,
    frameLookBackMs: 8000,
    windowLookBackMs: 1500,
  })

  const fallbackBlock = {
    component: ({ blockMatch }: any) => <span>{blockMatch?.visibleText || ''}</span>,
    lookBack: ({ output }: any) => ({ output, visibleText: output }),
  }

  const LLMText = ({ text, finished }: { text: string; finished: boolean }) => {
    const { visibleText } = useLLMOutput({
      llmOutput: text,
      blocks: [],
      fallbackBlock,
      isStreamFinished: finished,
      throttle,
    })
    return <>{visibleText}</>
  }

  // 终止 SSE 流
  const stopStreaming = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setStreaming(false)
    setStreamingMessageId(null)
    isStartingStreamRef.current = false
    
    // 清除 localStorage 中的待发送消息,防止刷新后重新发送
    if (conversationId && typeof window !== 'undefined') {
      try {
        const key = `pending_input_${conversationId}`
        window.localStorage.removeItem(key)
        window.localStorage.removeItem(`${key}_kb`)
      } catch {}
    }
  }

  // 抽取：启动 SSE 流式对话
  const startStreaming = async (sendConversationId: number, text: string, knowledgeBaseIds: number[] = []) => {
    // 重新加载消息以获取最新状态（包括刚添加的用户消息）
    try {
      const res = await axiosInstance.get(`/conversation/${sendConversationId}`)
      const data = res?.data
      if (data && data.code === 200 && Array.isArray(data.data)) {
        setMessages(data.data as MessageType[])
        setMessagesError(null)
      }
    } catch (e: any) {
      console.error('加载消息失败:', e?.message || e)
    }

    // 创建占位的助手消息用于流式显示
    const placeholderId = Date.now()
    setMessages((prev) => ([
      ...prev,
      {
        id: placeholderId,
        conversationId: sendConversationId,
        role: "assistant",
        content: "",
      },
    ]))
    setStreaming(true)
    setStreamingMessageId(placeholderId)

    const base = apiBase || (typeof window !== 'undefined' ? window.location.origin : '')
    const token = (typeof window !== 'undefined') ? window.localStorage.getItem('access_token') : null
    const tokenQuery = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''
    const kbQuery = knowledgeBaseIds.length
      ? `&${knowledgeBaseIds.map((id) => `knowledgeBaseIds=${encodeURIComponent(id)}`).join("&")}`
      : "";
    const esUrl = `${base}/api/agent/chat/stream?conversationId=${sendConversationId}&input=${encodeURIComponent(text)}${tokenQuery ? `&access_token=${encodeURIComponent(tokenQuery)}` : ''}${kbQuery}`
    
    return new Promise<void>((resolve, reject) => {
      const es = new EventSource(esUrl, { withCredentials: false })
      eventSourceRef.current = es
      
      es.onmessage = (ev) => {
        const chunk = ev.data || ''
        setMessages((prev) => prev.map(m => (
          m.id === placeholderId ? { ...m, content: m.content + chunk } : m
        )))
      }
      es.addEventListener('done', async () => {
        try {
          const resAll = await axiosInstance.get(`/conversation/${sendConversationId}`)
          const dataAll = resAll?.data
          if (dataAll && dataAll.code === 200 && Array.isArray(dataAll.data)) {
            setMessages(dataAll.data as MessageType[])
          }
        } finally {
          if (typeof window !== 'undefined') {
            try {
              window.localStorage.removeItem(`pending_input_${sendConversationId}_kb`)
            } catch {}
          }
          setStreaming(false)
          setStreamingMessageId(null)
          eventSourceRef.current = null
          es.close()
          resolve()
        }
      })
      es.onerror = (err) => {
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem(`pending_input_${sendConversationId}_kb`)
          } catch {}
        }
        es.close()
        eventSourceRef.current = null
        setStreaming(false)
        setStreamingMessageId(null)
        reject(err as any)
      }
    })
  }

  // 会话页面加载后：若存在 pending_input_{id}，自动添加消息并发起流式对话
  useEffect(() => {
    if (!conversationId) return
    if (isStartingStreamRef.current) return

    const checkAndSend = async () => {
      try {
        if (typeof window === 'undefined') return
        const key = `pending_input_${conversationId}`
        const pending = window.localStorage.getItem(key)
        const kbKey = `${key}_kb`
        let kbIds: number[] = []
        const storedKb = window.localStorage.getItem(kbKey)
        if (storedKb) {
          try {
            const parsed = JSON.parse(storedKb)
            if (Array.isArray(parsed)) {
              kbIds = parsed.map((item) => Number(item)).filter((item) => Number.isFinite(item))
            }
          } catch {}
        }

        if (pending && pending.trim()) {
          // 立即清除 localStorage,防止刷新后重复发送
          try {
            window.localStorage.removeItem(key)
            window.localStorage.removeItem(kbKey)
          } catch {}

          isStartingStreamRef.current = true
          try {
            // 1. 添加用户消息
            const messageRes = await axiosInstance.post("/message/add", {
              conversationId: conversationId,
              role: "user",
              content: pending.trim()
            })
            const messageData = messageRes?.data
            if (messageData?.code !== 200) {
              throw new Error(messageData?.message || '添加消息失败')
            }

            // 2. 发起流式对话
            await startStreaming(conversationId, pending.trim(), kbIds)
          } finally {
            isStartingStreamRef.current = false
          }
        }
      } catch (error: any) {
        console.error('处理pending消息失败:', error?.message || error)
        isStartingStreamRef.current = false
      }
    }

    // 使用 setTimeout 确保在 DOM 更新后执行
    const timer = setTimeout(() => {
      checkAndSend()
    }, 200)

    return () => clearTimeout(timer)
  }, [conversationId, startStreaming])

  return (
    <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4 flex-1 w-full min-h-svh">
      {conversationId ? (
        <>
          {/* 简单消息列表 - 限制在 PromptBox 相同宽度 */}
          <div className="flex-1 overflow-hidden flex items-start justify-center">
            <div className="w-[40%] max-w-[720px]">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <MessageLoading />
                </div>
              ) : messagesError ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-red-500">{messagesError}</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-neutral-500">暂无消息</p>
                </div>
              ) : (
                <div ref={scrollRef} className="relative w-full py-4 pb-28 space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className="flex w-full">
                      <div
                        className={
                          m.role === 'user'
                            ? 'ml-auto max-w-[80%] rounded-lg bg-[#E7EAF5] text-black px-4 py-2'
                            : 'w-full text-foreground px-0 py-0 mt-1'
                        }
                      >
                        {m.role === 'user' ? (
                          <div className="w-full" aria-label="user-query-bubble-with-background">
                            <span className="block" aria-hidden="true"></span>
                            <span className="block">
                              <div role="heading" aria-level={2} className="text-inherit text-sm md:text-base leading-6 md:leading-7">
                                <p className="whitespace-pre-wrap break-words text-inherit">{m.content}</p>
                              </div>
                            </span>
                          </div>
                        ) : (
                          streaming && m.id === streamingMessageId && (!m.content || m.content.length === 0) ? (
                            <div className="w-full m-0 pl-2">
                              <MessageLoading />
                            </div>
                          ) : (
                            <div className="w-full m-0 pl-2 prose prose-sm md:prose-base dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {m.content || ""}
                              </ReactMarkdown>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-4">
              选择一个会话开始聊天
            </p>
            <p className="text-neutral-500">
              或点击"New Chat"创建新会话
            </p>
          </div>
        </div>
      )}
      {/* PromptBox 悬浮固定在底部（无论是否有会话都显示） */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-2 md:px-0">
        <div className="w-[40%] max-w-[720px]">
          <PromptBox 
            isStreaming={streaming}
            onStop={stopStreaming}
            onSend={async ({ text, knowledgeBaseIds }) => {
            if (streaming || isStartingStreamRef.current) return

            isStartingStreamRef.current = true
            try {
              if (!conversationId) {
                // 无会话：先创建会话 -> 添加消息 -> 发起流 -> 跳转
                const createRes = await axiosInstance.post('/conversation/create', { title: text })
                const createData = createRes?.data
                if (!(createData && createData.code === 200 && createData.data?.id)) {
                  throw new Error(createData?.message || '创建会话失败')
                }
                const newId: number = Number(createData.data.id)

                // 添加用户消息
                const messageRes = await axiosInstance.post("/message/add", {
                  conversationId: newId,
                  role: "user",
                  content: text
                })
                const messageData = messageRes?.data
                if (messageData?.code !== 200) {
                  throw new Error(messageData?.message || '添加消息失败')
                }

                // 发起流式对话
                await startStreaming(newId, text, knowledgeBaseIds ?? [])

                // 跳转到新会话
                router.replace(`/chat/${newId}` as any)
              } else {
                // 已有会话：直接添加消息 -> 发起流
                // 添加用户消息
                const messageRes = await axiosInstance.post("/message/add", {
                  conversationId: conversationId,
                  role: "user",
                  content: text
                })
                const messageData = messageRes?.data
                if (messageData?.code !== 200) {
                  throw new Error(messageData?.message || '添加消息失败')
                }

                // 发起流式对话
                await startStreaming(conversationId, text, knowledgeBaseIds ?? [])
              }
            } catch (error: any) {
              console.error('发送消息失败:', error?.message || error)
              // 可以在这里添加错误提示
            } finally {
              isStartingStreamRef.current = false
            }
          }} />
        </div>
      </div>
    </div>
  )
}

type MessageType = {
  id: number
  conversationId: number
  role: string
  content: string
  createdAt?: string
}
