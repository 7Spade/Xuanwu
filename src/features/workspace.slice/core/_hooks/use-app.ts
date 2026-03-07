/**
 * Module: use-app.ts
 * Purpose: compatibility re-export for shared app hook
 * Responsibilities: provide a stable workspace-core import path for useApp
 * Constraints: deterministic logic, respect module boundaries
 */

// Re-exported from shared/app-providers/app-provider for backward compatibility.
// All new code should import directly from '@/shared/app-providers/app-provider'.
export { useApp } from '@/shared/app-providers/app-provider'
