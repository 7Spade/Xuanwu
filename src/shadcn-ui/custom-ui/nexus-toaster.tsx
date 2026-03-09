/**
 * Module: nexus-toaster
 * Purpose: Provide app-wide toast host with coherent border optics and blur surface.
 * Responsibilities: mount Sonner toaster once with custom class tokens.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import { Toaster } from "@/shadcn-ui/sonner"

export function NexusToaster() {
  return (
    <Toaster
      richColors
      toastOptions={{
        className:
          "rounded-xl border-none bg-background/90 shadow-xl ring-1 ring-zinc-300/50 backdrop-blur-lg dark:ring-white/10",
      }}
    />
  )
}
