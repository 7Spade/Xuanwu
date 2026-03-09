/**
 * Module: document-parser-loading
 * Purpose: Render document parser tab loading boundary.
 * Responsibilities: delegate to shared loading preset for consistent skeleton optics.
 * Constraints: deterministic logic, respect module boundaries
 */
import { WorkspaceBusinessTabLoading } from "@/shadcn-ui/custom-ui"

export default function Loading() {
  return <WorkspaceBusinessTabLoading preset="documentParser" />
}
