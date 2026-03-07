import { Skeleton } from "@/shadcn-ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4 pt-4">
      <Skeleton className="h-7 w-2/5" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  )
}
