import { NexusSkeletonBlock, RouteStreamShell } from "@/shadcn-ui/custom-ui";

export default function ReportsLoading() {
  return (
    <RouteStreamShell className="p-5">
      <NexusSkeletonBlock rows={3} className="bg-transparent p-0 ring-0" />
    </RouteStreamShell>
  );
}
