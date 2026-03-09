/**
 * Module: dashboard/workspaces/page
 * Purpose: Preserve compatibility for legacy workspace dashboard links.
 * Responsibilities: Redirect /dashboard/workspaces to canonical /workspaces route.
 * Constraints: deterministic logic, respect module boundaries
 */
import { redirect } from "next/navigation";

export default function DashboardWorkspacesAliasPage() {
  redirect("/workspaces");
}
