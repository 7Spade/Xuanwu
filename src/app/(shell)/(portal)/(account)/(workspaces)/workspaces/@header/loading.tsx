/**
 * Module: workspaces/@header/loading
 * Purpose: Provide consistent skeleton fallback for workspaces header slot.
 * Responsibilities: preserve shell rhythm while parallel header content streams.
 * Constraints: deterministic logic, respect module boundaries
 */
import { ParallelSlotHeaderLoading } from "@/shadcn-ui/custom-ui";

export default function WorkspacesHeaderSlotLoading() {
  return <ParallelSlotHeaderLoading titleWidthClassName="w-44" searchWidthClassName="w-72" />;
}
