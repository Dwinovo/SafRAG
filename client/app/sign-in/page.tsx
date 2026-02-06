"use client"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { NavHeroHeader } from "@/components/ui/nav-hero-header"
import { Footerdemo } from "@/components/ui/footer-section"

const SignIn = dynamic(() => import("@/components/ui/sign-in").then(m => m.SignInPage), { ssr: false })

function SignInPageContent() {
  const { useAppDispatch, loginThunk } = require("@/lib/store")
  const dispatch = useAppDispatch()
  const { useRouter, useSearchParams } = require("next/navigation")
  const router = useRouter()
  const search = useSearchParams()
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const username = (form.elements.namedItem("nickname") as HTMLInputElement)?.value
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value
    const res = await dispatch(loginThunk({ username, password }))
    // @ts-ignore unwrap result
    if ((res as any).meta.requestStatus === "fulfilled") {
      router.replace("/")
    }
  }
  return (
    <AuroraBackground className="items-stretch justify-start">
      <NavHeroHeader />
      <main className="flex flex-1 items-center justify-center p-0 z-10 pt-24 md:pt-32 w-full">
        <SignIn onSignIn={handleSignIn} />
      </main>
      <Footerdemo />
    </AuroraBackground>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPageContent />
    </Suspense>
  )
}
