/**
 * Module: mode-toggle
 * Purpose: Provide an app-wide theme mode toggle with a compact dropdown trigger.
 * Responsibilities: expose light/dark/system selection using next-themes and i18n labels.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

import { useI18n } from "@/app-runtime/providers/i18n-provider"
import { useTheme } from "@/app-runtime/providers/theme-provider"
import IconButton from "@/lib-ui/custom-ui/icon-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn-ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme } = useTheme()
  const { t } = useI18n()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <IconButton
        variant="ghost"
        suppressHydrationWarning
        aria-label={t("common.toggleTheme")}
        className="relative rounded-xl ring-1 ring-zinc-300/50 ring-offset-2 ring-offset-background transition-all duration-200 ease-out hover:bg-background/80 hover:ring-zinc-300/70 focus-visible:ring-2 focus-visible:ring-zinc-500/70 active:scale-[0.98] dark:ring-white/10"
      >
        <Sun className="size-4" />
        <span className="sr-only">{t("common.toggleTheme")}</span>
      </IconButton>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="ghost"
          suppressHydrationWarning
          className="relative rounded-xl ring-1 ring-zinc-300/50 ring-offset-2 ring-offset-background transition-all duration-200 ease-out hover:bg-background/80 hover:ring-zinc-300/70 focus-visible:ring-2 focus-visible:ring-zinc-500/70 active:scale-[0.98] dark:ring-white/10"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t("common.toggleTheme")}</span>
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-36 rounded-xl border-none bg-background/90 p-1.5 shadow-xl ring-1 ring-zinc-300/50 backdrop-blur-lg dark:ring-white/10"
      >
        <DropdownMenuItem onClick={() => setTheme("light")}>{t("common.light")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>{t("common.dark")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>{t("common.system")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
