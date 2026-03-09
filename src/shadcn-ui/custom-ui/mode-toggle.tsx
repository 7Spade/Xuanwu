/**
 * Module: mode-toggle
 * Purpose: Provide an app-wide theme mode toggle with a compact dropdown trigger.
 * Responsibilities: expose light/dark/system selection using next-themes and i18n labels.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import { Moon, Sun } from "lucide-react"

import { useI18n } from "@/app-runtime/providers/i18n-provider"
import { useTheme } from "@/app-runtime/providers/theme-provider"
import { Button } from "@/shadcn-ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn-ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme } = useTheme()
  const { t } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-xl ring-1 ring-zinc-300/50 transition-all duration-200 ease-out active:scale-[0.98] hover:bg-background/80 hover:ring-zinc-300/70 dark:ring-white/10"
        >
          <Sun className="size-4 scale-100 rotate-0 transition-all duration-200 dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-all duration-200 dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{t("common.toggleTheme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-36 rounded-xl border-none bg-background/90 p-1.5 shadow-xl ring-1 ring-zinc-300/50 backdrop-blur-lg dark:ring-white/10"
      >
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {t("common.light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {t("common.dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          {t("common.system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
