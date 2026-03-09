"use client"

import { Globe } from "lucide-react"

import { useI18n } from "@/app-runtime/providers/i18n-provider"
import { type Locale } from "@/config/i18n/i18n-types"
import { Button } from "@/shadcn-ui/button"
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

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-xl ring-1 ring-zinc-300/50 transition-all duration-200 ease-out active:scale-[0.98] hover:bg-background/80 hover:ring-zinc-300/70 dark:ring-white/10"
        >
          <Globe className="size-4" />
          <span className="sr-only">{t("common.switchLanguage")}</span>
        </Button>
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
