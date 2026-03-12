/**
 * Module: avatar-badge
 * Purpose: Compose avatar + badge for compact identity chips in list and header contexts.
 * Responsibilities: unify avatar fallback, status badge, and spacing tokens.
 * Constraints: deterministic logic, respect module boundaries
 */
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn-ui/avatar"
import { Badge } from "@/shadcn-ui/badge"
import { cn } from "@/shadcn-ui/utils/utils"

interface AvatarBadgeProps {
  name: string
  imageUrl?: string
  badgeLabel?: string
  className?: string
}

function toInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?"
}

export function AvatarBadge({ name, imageUrl, badgeLabel, className }: AvatarBadgeProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Avatar className="size-8 ring-1 ring-zinc-300/60 dark:ring-white/10">
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback className="text-[11px] font-semibold tracking-tight">{toInitial(name)}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium tracking-tight">{name}</span>
      {badgeLabel ? (
        <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] tracking-tight">
          {badgeLabel}
        </Badge>
      ) : null}
    </div>
  )
}
