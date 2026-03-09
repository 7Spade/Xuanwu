import { Skeleton } from "@/shadcn-ui/skeleton";
import { RouteStreamShell } from "@/app/(shell)/(portal)/(account)/_components/route-stream-shell";

export default function ReportsLoading() {
  return (
    <RouteStreamShell className="space-y-3 p-5">
      <Skeleton className="h-7 w-48 rounded-lg" />
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-24 rounded-xl opacity-85" />
    </RouteStreamShell>
  );
}
