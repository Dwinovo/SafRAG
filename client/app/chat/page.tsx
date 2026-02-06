"use client"
import { PromptBox } from "@/components/ui/knowledge-prompt-box"
import { Typewriter } from "@/components/ui/typewriter-text"
import { axiosInstance } from "@/lib/axios"
import { useRouter } from "next/navigation"
import { useChatContext } from "./chat-context"

export default function ChatHomePage() {
  const router = useRouter()
  const { addConversation } = useChatContext()

  return (
    <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col items-center justify-center gap-2 flex-1 w-full min-h-svh">
      <div className="w-[40%] max-w-[720px] mx-auto">
        <div className="mb-4 text-center">
          <Typewriter
            text={["How can I help you?", "Ready when you are.", "Ask me anything."]}
            speed={90}
            loop={true}
            className="text-2xl md:text-3xl font-bold text-black dark:text-white"
          />
        </div>
        <PromptBox onSend={async ({ text, knowledgeBaseIds }) => {
          try {
            // 1. 创建新会话
            const createRes = await axiosInstance.post("/conversation/create", { title: text })
            const createData = createRes?.data
            if (!(createData && createData.code === 200 && createData.data?.id)) {
              throw new Error(createData?.message || '创建会话失败')
            }
            const newId = createData.data.id

            // 2. 保存输入信息到localStorage，让对话页面自动处理
            const storageKey = `pending_input_${newId}`
            if (typeof window !== 'undefined') {
              try {
                window.localStorage.setItem(storageKey, text)
                window.localStorage.setItem(`${storageKey}_kb`, JSON.stringify(knowledgeBaseIds ?? []))
              } catch {}
            }

            // 3. 更新本地状态
            addConversation({ id: newId, userId: 0, title: text })

            // 4. 跳转到对话页面
            await new Promise(resolve => setTimeout(resolve, 50))
            router.push(`/chat/${newId}` as any)

          } catch (error: any) {
            console.error('创建对话失败:', error?.message || error)
            // 可以在这里添加错误提示
          }
        }} />
      </div>
    </div>
  )
}
