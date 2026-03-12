/**
 * Module: language-switcher
 * Purpose: Provide an app-wide locale switcher with deterministic hydration behavior.
 * Responsibilities: expose locale selection menu and maintain accessible trigger labels.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import { Globe } from "lucide-react"
import { useEffect, useState } from "react"

import { useI18n } from "@/app-runtime/providers/i18n-provider"
import { type Locale } from "@/config/i18n/i18n-types"
import IconButton from "@/lib-ui/custom-ui/icon-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn-ui/dropdown-menu"

const LOCALE_NAMES: Record<Locale, string> = {
  en: "common.languageEnglish",
  "zh-TW": "common.languageTraditionalChinese",
}

const DEFAULT_TRIGGER_CLASS_NAME = "rounded-xl ring-1 ring-zinc-300/50 ring-offset-2 ring-offset-background transition-all duration-200 ease-out hover:bg-background/80 hover:ring-zinc-300/70 focus-visible:ring-2 focus-visible:ring-zinc-500/70 active:scale-[0.98] dark:ring-white/10"

interface LanguageSwitcherProps {
  triggerClassName?: string
}

export function LanguageSwitcher({ triggerClassName }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n()
  const [isMounted, setIsMounted] = useState(false)
  const triggerClasses = triggerClassName ?? DEFAULT_TRIGGER_CLASS_NAME

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <IconButton
        variant="ghost"
        suppressHydrationWarning
        aria-label={t("common.switchLanguage")}
        className={triggerClasses}
      >
        <Globe className="size-4" />
        <span className="sr-only">{t("common.switchLanguage")}</span>
      </IconButton>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="ghost"
          suppressHydrationWarning
          className={triggerClasses}
        >
          <Globe className="size-4" />
          <span className="sr-only">{t("common.switchLanguage")}</span>
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-36 rounded-xl border-none bg-background/90 p-1.5 shadow-xl ring-1 ring-zinc-300/50 backdrop-blur-lg dark:ring-white/10"
      >
        <DropdownMenuItem
          onClick={() => setLocale("en")}
          className={locale === "en" ? "bg-accent" : ""}
        >
          {t(LOCALE_NAMES["en"])}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale("zh-TW")}
          className={locale === "zh-TW" ? "bg-accent" : ""}
        >
          {t(LOCALE_NAMES["zh-TW"])}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
