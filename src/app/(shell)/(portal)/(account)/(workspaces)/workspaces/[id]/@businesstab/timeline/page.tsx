import { redirect } from "next/navigation";

/**
 * Module: page.tsx
 * Purpose: Workspace timeline capability route.
 * Responsibilities: preserve legacy timeline route via redirect to merged schedule page.
 * Constraints: deterministic logic, respect module boundaries
 */

export default async function TimelineCapabilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/workspaces/${id}/schedule`);
}
