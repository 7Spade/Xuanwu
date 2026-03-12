/**
 * Module: inline-spinner
 * Purpose: Provide a standard spinner line item for asynchronous inline actions.
 * Responsibilities: compose spinner primitive with optional caption and shared spacing tokens.
 * Constraints: deterministic logic, respect module boundaries
 */
import { Spinner } from "@/shadcn-ui/spinner"
import { cn } from "@/shadcn-ui/utils/utils"

interface InlineSpinnerProps {
  label?: string
  className?: string
}

export function InlineSpinner({ label, className }: InlineSpinnerProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Spinner className="size-4" />
      {label ? <span className="tracking-tight">{label}</span> : null}
    </div>
  )
}
