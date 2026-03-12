/**
 * Module: status-progress
 * Purpose: Provide a compact progress indicator with label and optional percentage text.
 * Responsibilities: compose progress primitive with accessible labels and deterministic layout.
 * Constraints: deterministic logic, respect module boundaries
 */
import { Progress } from "@/shadcn-ui/progress"
import { cn } from "@/shadcn-ui/utils/utils"

interface StatusProgressProps {
  label: string
  value: number
  showValue?: boolean
  className?: string
}

export function StatusProgress({
  label,
  value,
  showValue = true,
  className,
}: StatusProgressProps) {
  const normalized = Math.min(100, Math.max(0, value))

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs tracking-tight text-muted-foreground">
        <span>{label}</span>
        {showValue ? <span>{normalized}%</span> : null}
      </div>
      <Progress value={normalized} className="h-2 rounded-full" />
    </div>
  )
}
