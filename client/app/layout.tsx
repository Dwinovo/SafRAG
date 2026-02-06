import "./globals.css"
import type { ReactNode } from "react"
import type { Metadata } from "next"
import { AppStoreProvider } from "@/lib/store-provider"

export const metadata: Metadata = {
  title: "御典",
  description: "御典——可证明安全的访问控制 RAG 系统",
  icons: {
    icon: [
      {
        url: "/logo.png",
        type: "image/png",
      },
    ],
    shortcut: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-dvh bg-white antialiased">
        <AppStoreProvider>
          {children}
        </AppStoreProvider>
      </body>
    </html>
  )
}
