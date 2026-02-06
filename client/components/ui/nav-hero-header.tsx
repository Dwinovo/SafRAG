"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import UserProfileDemo from "@/components/ui/user-profile-demo"
import { getCurrentUserId } from "@/lib/auth"
import { axiosInstance } from "@/lib/axios"
import { setUserProfile } from "@/lib/store"
import { HeaderLogo } from "@/components/ui/header-logo"

const menuItems = [
  { name: "对话", href: "/chat" as const },
  { name: "知识库", href: "/rag" as const },
  { name: "个人中心", href: "/profile" as const },
  { name: "关于", hash: "about" as const },
] as const

export function NavHeroHeader() {
  const [menuState, setMenuState] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { isAuthenticated, user } = useAppSelector(s => s.auth)
  const dispatch = useAppDispatch()
  const profileFetchedRef = React.useRef(false)

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  React.useEffect(() => {
    if (!isAuthenticated) {
      profileFetchedRef.current = false
      return
    }
    if (profileFetchedRef.current) {
      return
    }
    if (user?.avatarUrl && user.avatarUrl.trim().length > 0) {
      profileFetchedRef.current = true
      return
    }

    profileFetchedRef.current = true

    const fetchProfile = async () => {
      try {
        const userId = getCurrentUserId()
        if (!userId) return
        const res = await axiosInstance.get(`/user/${userId}`)
        const { code, data } = res.data ?? {}
        if (code === 200 && data) {
          dispatch(setUserProfile({ username: data.username, avatarUrl: data.avatarUrl }))
        }
      } catch {
        // 忽略错误，保持默认头像
      }
    }

    fetchProfile()
  }, [isAuthenticated, user?.avatarUrl, dispatch])

  return (
    <header>
      <nav data-state={menuState && "active"} className="fixed group z-20 w-full px-2">
        <div className={cn(
          "mx-auto mt-2 max-w-6xl px-8 transition-all duration-300 lg:px-16",
          isScrolled && "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-8"
        )}>
          <div className="relative flex flex-wrap items-center justify-between gap-8 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <HeaderLogo className="flex items-center space-x-2" priority />

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-10 text-base font-medium">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    {"href" in item ? (
                      <Link href={item.href} className="text-muted-foreground hover:text-foreground block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    ) : (
                      <Link href={{ pathname: "/", hash: item.hash }} className="text-muted-foreground hover:text-foreground block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-8 text-lg font-medium">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      {"href" in item ? (
                        <Link href={item.href} className="text-muted-foreground hover:text-foreground block duration-150">
                          <span>{item.name}</span>
                        </Link>
                      ) : (
                        <Link href={{ pathname: "/", hash: item.hash }} className="text-muted-foreground hover:text-foreground block duration-150">
                          <span>{item.name}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col items-end space-y-4 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0 md:w-fit">
                {isAuthenticated && !menuState && !isScrolled ? (
                  <UserProfileDemo variant="nav" />
                ) : !isAuthenticated ? (
                  <Button asChild variant="outline" size="default" className={cn(isScrolled && "lg:hidden")}>
                    <Link href="/sign-in">
                      <span>登录</span>
                    </Link>
                  </Button>
                ) : null}
                <Button asChild size="default" className={cn(isScrolled ? "lg:inline-flex" : "hidden")}>
                  <Link href="/chat">
                    <span>立即体验</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
