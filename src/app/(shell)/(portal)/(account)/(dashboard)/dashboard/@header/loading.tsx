/**
 * Module: dashboard/@header/loading
 * Purpose: Provide a lightweight skeleton header while header slot hydrates.
 * Responsibilities: avoid header jump during parallel route transitions.
 * Constraints: deterministic logic, respect module boundaries
 */
import { ParallelSlotHeaderLoading } from "@/lib-ui/custom-ui";

export default function DashboardHeaderSlotLoading() {
  return <ParallelSlotHeaderLoading titleWidthClassName="w-52" searchWidthClassName="w-80" />;
}
