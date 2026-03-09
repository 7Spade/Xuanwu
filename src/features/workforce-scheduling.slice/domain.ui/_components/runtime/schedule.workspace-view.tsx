// Business responsibility: workspace schedule overview and navigation
"use client";

import { useWorkspace } from "@/features/workspace.slice";

import { useWorkspaceSchedule } from "../../_hooks/runtime/use-workspace-schedule";

import { UnifiedCalendarGrid } from "./unified-calendar-grid";

export function WorkspaceSchedule() {
  const { workspace } = useWorkspace();
  const {
    localItems,
    organizationMembers,
    currentDate,
    handleMonthChange,
    handleOpenAddDialog,
  } = useWorkspaceSchedule();

  return (
    <div className="space-y-4">
      <div className="h-[calc(100vh-22rem)]">
        <UnifiedCalendarGrid
          items={localItems}
          members={organizationMembers}
          viewMode="workspace"
          currentDate={currentDate}
          onMonthChange={handleMonthChange}
          onAddClick={handleOpenAddDialog}
        />
      </div>
    </div>
  );
}
