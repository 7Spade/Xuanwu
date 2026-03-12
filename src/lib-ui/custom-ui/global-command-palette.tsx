/**
 * Module: global-command-palette
 * Purpose: Provide an app-wide command palette shell with keyboard shortcut support.
 * Responsibilities: render command dialog primitives and normalize palette visual rhythm.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import { Search } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"

import { useI18n } from "@/app-runtime/providers/i18n-provider"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shadcn-ui/command"

interface PaletteAction {
  id: string
  label: string
  hint?: string
  onSelect: () => void
  icon?: ReactNode
}

interface GlobalCommandPaletteProps {
  actions: PaletteAction[]
  shortcut?: string
}

export function GlobalCommandPalette({
  actions,
  shortcut = "k",
}: GlobalCommandPaletteProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === shortcut.toLowerCase()) {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [shortcut])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="rounded-2xl border-none bg-background/95 shadow-2xl ring-1 ring-zinc-300/50 backdrop-blur-xl dark:ring-white/10">
        <CommandInput placeholder={t("globalSearch.placeholder")} />
        <CommandList>
          <CommandEmpty>{t("globalSearch.noResults")}</CommandEmpty>
          <CommandGroup heading={t("navigation.dashboard")}>
            {actions.map((action) => (
              <CommandItem
                key={action.id}
                onSelect={() => {
                  action.onSelect()
                  setOpen(false)
                }}
                className="gap-2"
              >
                {action.icon ?? <Search className="size-4" />}
                <span className="flex-1">{action.label}</span>
                {action.hint ? (
                  <span className="text-[10px] uppercase tracking-tight text-muted-foreground">
                    {action.hint}
                  </span>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
