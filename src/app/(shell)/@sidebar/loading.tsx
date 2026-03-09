/**
 * Module: @sidebar/loading
 * Purpose: Provide skeleton fallback for sidebar parallel slot while shell streams.
 * Responsibilities: keep global shell frame stable during slot hydration.
 * Constraints: deterministic logic, respect module boundaries
 */
import { NexusSkeletonBlock } from "@/shadcn-ui/custom-ui";

export default function SidebarSlotLoading() {
  return (
    <aside className="flex h-screen w-64 flex-col gap-4 bg-background/70 px-3 py-3 ring-1 ring-zinc-300/50 backdrop-blur-sm dark:ring-white/10">
      <NexusSkeletonBlock rows={3} className="bg-transparent p-0 ring-0" />
      <NexusSkeletonBlock rows={2} className="mt-2" />
      <NexusSkeletonBlock rows={1} className="mt-auto" />
    </aside>
  );
}
