/**
 * Module: tanstack-form-field
 * Purpose: Provide a styled field wrapper for @tanstack/react-form fields.
 * Responsibilities: compose TanStack form field with label, error message, and
 *   children slot using project typography/ring aesthetics.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import type { ReactNode } from "react"
import type { AnyFieldApi } from "@tanstack/react-form"

import { cn } from "@/shadcn-ui/utils/utils"

interface TanstackFormFieldProps {
  field: AnyFieldApi
  label: string
  children: ReactNode
  className?: string
  required?: boolean
}

export function TanstackFormField({
  field,
  label,
  children,
  className,
  required,
}: TanstackFormFieldProps) {
  const hasError =
    field.state.meta.isTouched && field.state.meta.errors.length > 0

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={String(field.name)}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">*</span>
        )}
      </label>
      {children}
      {hasError && (
        <p className="text-xs text-destructive">
          {field.state.meta.errors.join(", ")}
        </p>
      )}
    </div>
  )
}
