import { Skeleton } from "@/shadcn-ui/skeleton"
import { RouteStreamShell } from "@/shadcn-ui/custom-ui/route-stream-shell"

export default function Loading() {
  return (
    <RouteStreamShell className="space-y-4 pt-4">
      <Skeleton className="h-7 w-2/5" />
      <Skeleton className="h-56 w-full" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24 opacity-90" />
        <Skeleton className="h-24 opacity-80" />
      </div>
    </RouteStreamShell>
  )
}
