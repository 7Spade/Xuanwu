/**
 * Module: tasks-loading
 * Purpose: Render tasks tab loading boundary.
 * Responsibilities: delegate to shared loading preset for consistent skeleton optics.
 * Constraints: deterministic logic, respect module boundaries
 */
import { WorkspaceBusinessTabLoading } from "@/shadcn-ui/custom-ui/workspace-businesstab-loading"

export default function Loading() {
  return <WorkspaceBusinessTabLoading preset="tasks" />
}
