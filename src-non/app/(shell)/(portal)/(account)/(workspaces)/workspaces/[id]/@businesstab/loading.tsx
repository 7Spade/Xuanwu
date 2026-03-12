/**
 * Module: businesstab-loading
 * Purpose: Render workspace business-tab root loading boundary.
 * Responsibilities: delegate to shared loading preset for consistent skeleton optics.
 * Constraints: deterministic logic, respect module boundaries
 */
import { WorkspaceBusinessTabLoading } from "@/lib-ui/custom-ui"

export default function Loading() {
  return <WorkspaceBusinessTabLoading preset="overview" />
}
