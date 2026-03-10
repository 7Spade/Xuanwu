/**
 * Module: landing/page
 * Purpose: Public landing entry page for unauthenticated users.
 * Responsibilities: Redirect authenticated users and provide login entry action.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { useAuth } from "@/app-runtime/providers/auth-provider"
import { useI18n } from "@/app-runtime/providers/i18n-provider"
import { LoginForm, RegisterForm, ResetPasswordForm } from "@/features/identity.slice"
import { completeRegistration, signIn } from "@/features/identity.slice/_actions"
import { Button } from "@/shadcn-ui/button"
import { LanguageSwitcher, ModeToggle, NexusDialogShell } from "@/lib-ui/custom-ui"
import { toast } from "@/shadcn-ui/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn-ui/tabs"

export default function LandingPage() {
  const { state } = useAuth()
  const router = useRouter()
  const { t } = useI18n()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (state.user) {
      router.push("/dashboard")
    }
  }, [state.user, router])

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const result = await signIn(email, password)
      if (!result.success) {
        toast({
          variant: "destructive",
          title: t("auth.authenticationFailed"),
          description: result.error.message,
        })
        return
      }

      setIsLoginOpen(false)
      router.push("/dashboard")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("common.unknownError")
      toast({
        variant: "destructive",
        title: t("auth.authenticationFailed"),
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    setIsLoading(true)
    try {
      if (!name) {
        throw new Error(t("auth.pleaseSetDisplayName"))
      }

      const result = await completeRegistration(email, password, name)
      if (!result.success) {
        toast({
          variant: "destructive",
          title: t("auth.authenticationFailed"),
          description: result.error.message,
        })
        return
      }

      setIsLoginOpen(false)
      router.push("/dashboard")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("common.unknownError")
      toast({
        variant: "destructive",
        title: t("auth.authenticationFailed"),
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openResetDialog = () => {
    setIsLoginOpen(false)
    setIsResetOpen(true)
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-background via-zinc-50/40 to-background dark:from-background dark:via-zinc-950/30 dark:to-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(161,161,170,0.12),transparent_36%),radial-gradient(circle_at_80%_90%,rgba(113,113,122,0.12),transparent_34%)]" />
      <div className="absolute right-3 top-3 z-20 flex w-[calc(100%-1.5rem)] items-center justify-end gap-2 sm:right-4 sm:top-4 sm:w-auto">
        <ModeToggle />
        <LanguageSwitcher />
        <Button
          aria-label={t("auth.enterDimension")}
          variant="outline"
          className="rounded-xl border-transparent bg-background/80 px-4 shadow-sm ring-1 ring-zinc-300/55 transition-all duration-200 ease-out hover:bg-background hover:ring-zinc-300/75 active:scale-[0.98] dark:ring-white/10"
          onClick={() => setIsLoginOpen(true)}
        >
          {t("auth.enterDimension")}
        </Button>
      </div>

      <div
        aria-label={t("common.enterOrgVerse")}
        className="relative z-10 px-6 text-center text-4xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl"
      >
        {t("common.enterOrgVerse")}
      </div>

      <NexusDialogShell
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        title={t("auth.enterDimension")}
        description={t("common.appDescription")}
        contentClassName="max-w-md p-5 sm:p-6"
      >
        <Tabs defaultValue="signin" className="pt-2">
          <TabsList className="mb-4 grid h-11 w-full grid-cols-2 rounded-xl bg-muted/30 p-1">
            <TabsTrigger value="signin" className="rounded-lg text-xs font-bold">
              {t("auth.enterDimension")}
            </TabsTrigger>
            <TabsTrigger value="register" className="rounded-lg text-xs font-bold">
              {t("auth.registerSovereignty")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="m-0">
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleLogin={handleLogin}
              isLoading={isLoading}
              onForgotPassword={openResetDialog}
            />
          </TabsContent>

          <TabsContent value="register" className="m-0">
            <RegisterForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleRegister={handleRegister}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </NexusDialogShell>

      <NexusDialogShell
        open={isResetOpen}
        onOpenChange={setIsResetOpen}
        title={t("auth.resetPassword")}
        description={t("auth.sendEmail")}
        contentClassName="max-w-md p-5 sm:p-6"
      >
        <div className="pt-2">
          <ResetPasswordForm
            defaultEmail={email}
            onSuccess={() => setIsResetOpen(false)}
            onCancel={() => setIsResetOpen(false)}
          />
        </div>
      </NexusDialogShell>
    </div>
  )
}
