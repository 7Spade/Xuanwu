/**
 * Module: nexus-nav-menu
 * Purpose: Provide a lightweight navigation-menu wrapper for top-level grouped links.
 * Responsibilities: map link configs to navigation-menu primitives with consistent interaction styles.
 * Constraints: deterministic logic, respect module boundaries
 */
import Link from "next/link"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/shadcn-ui/navigation-menu"
import { cn } from "@/shadcn-ui/utils/utils"

interface NavMenuItemModel {
  href: string
  label: string
  active?: boolean
}

interface NexusNavMenuProps {
  items: NavMenuItemModel[]
  className?: string
}

export function NexusNavMenu({ items, className }: NexusNavMenuProps) {
  return (
    <NavigationMenu className={cn("max-w-full", className)}>
      <NavigationMenuList className="gap-1 rounded-xl bg-background/55 p-1 ring-1 ring-zinc-300/50 backdrop-blur-sm dark:ring-white/10">
        {items.map((item) => (
          <NavigationMenuItem key={item.href}>
            <NavigationMenuLink asChild>
              <Link
                href={item.href}
                className={cn(
                  "inline-flex h-9 items-center rounded-lg px-3 text-sm tracking-tight transition-all duration-200 ease-out active:scale-[0.98]",
                  item.active
                    ? "bg-background text-foreground shadow-sm ring-1 ring-zinc-300/70 dark:ring-white/10"
                    : "text-muted-foreground hover:bg-background/85 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
