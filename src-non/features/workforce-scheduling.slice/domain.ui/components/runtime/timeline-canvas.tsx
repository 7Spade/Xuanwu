/**
 * Module: timeline-canvas.tsx
 * Purpose: Render schedule items as a vis timeline.
 * Responsibilities: transform schedule items and render via VisTimelineCanvas [D24/D28].
 * Constraints: must not import vis-data or vis-timeline directly; use @/lib-ui/vis.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { VisTimelineCanvas } from "@/lib-ui/vis";
import type { DataGroup, DataItem, Timeline, TimelineItem, TimelineOptions } from "@/lib-ui/vis";
import { cn } from "@/shadcn-ui/utils/utils";
import type { ScheduleItem } from "@/shared-kernel";
import { SKILLS } from "@/shared-kernel";

import type { TimelineMember } from '../../types/timeline.types';
import styles from "./timeline-canvas.module.css";
import {
  escapeHtml,
  resolveInitialWindow,
  resolveTimelineInterval,
  toTimelineClassName,
} from "./timeline-canvas.helpers";

interface TimelineCanvasProps {
  items: ScheduleItem[];
  members: TimelineMember[];
  enableDrag?: boolean;
  groupMode?: "none" | "workspace";
  onMoveItem?: (params: {
    itemId: string;
    start: Date;
    end: Date;
    groupId?: string;
  }) => Promise<boolean>;
  onDropTask?: (params: {
    taskId: string;
    droppedAt: Date;
  }) => Promise<boolean>;
  className?: string;
}

interface TimelineRenderableItem extends DataItem {
  taskTitle?: string;
  skillRequirements?: DisplaySkillRequirement[];
}

interface DisplaySkillRequirement {
  skillName: string;
  quantity: number;
}

function formatSkillRequirements(item: ScheduleItem, skillNameBySlug: Map<string, string>): DisplaySkillRequirement[] {
  const requirements = item.requiredSkills ?? [];
  if (requirements.length === 0) {
    return [{ skillName: "Not Set", quantity: 0 }];
  }

  return requirements.map((requirement) => {
    const skillName = skillNameBySlug.get(requirement.tagSlug) ?? requirement.tagSlug;
    const quantity = Math.max(1, requirement.quantity ?? 1);
    return { skillName, quantity };
  });
}

function createIconBadge(label: string, background: string, color: string): HTMLSpanElement {
  const icon = document.createElement("span");
  icon.textContent = label;
  icon.style.display = "inline-flex";
  icon.style.alignItems = "center";
  icon.style.justifyContent = "center";
  icon.style.width = "14px";
  icon.style.height = "14px";
  icon.style.borderRadius = "9999px";
  icon.style.background = background;
  icon.style.color = color;
  icon.style.fontSize = "9px";
  icon.style.fontWeight = "700";
  icon.style.lineHeight = "1";
  icon.style.flexShrink = "0";
  return icon;
}

function applyMarqueeIfOverflow(viewport: HTMLSpanElement, track: HTMLSpanElement): void {
  const update = () => {
    if (!viewport.isConnected || !track.isConnected) return;

    const overflowWidth = track.scrollWidth - viewport.clientWidth;
    if (overflowWidth > 2) {
      const durationSeconds = Math.max(6, Math.min(18, overflowWidth / 22));
      track.classList.add(styles.marqueeTrackAnimated);
      track.style.setProperty("--marquee-distance", `${overflowWidth}px`);
      track.style.setProperty("--marquee-duration", `${durationSeconds}s`);
      return;
    }

    track.classList.remove(styles.marqueeTrackAnimated);
    track.style.removeProperty("--marquee-distance");
    track.style.removeProperty("--marquee-duration");
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(update);
  });
}

function createMarqueeText(value: string, color?: string): { viewport: HTMLSpanElement; track: HTMLSpanElement } {
  const track = document.createElement("span");
  track.textContent = value;
  track.className = styles.marqueeTrack;
  if (color) {
    track.style.color = color;
  }

  const viewport = document.createElement("span");
  viewport.className = styles.marqueeViewport;
  viewport.appendChild(track);

  applyMarqueeIfOverflow(viewport, track);

  return { viewport, track };
}

function buildTimelineItemElement(taskTitle: string, skillRequirements: DisplaySkillRequirement[]): HTMLElement {
  const root = document.createElement("div");
  root.style.display = "flex";
  root.style.flexDirection = "column";
  root.style.gap = "2px";
  root.style.whiteSpace = "normal";
  root.style.width = "100%";
  root.style.maxWidth = "100%";
  root.style.minWidth = "0";
  root.style.overflow = "hidden";

  const titleRow = document.createElement("div");
  titleRow.style.display = "grid";
  titleRow.style.gridTemplateColumns = "14px minmax(0, 1fr)";
  titleRow.style.alignItems = "center";
  titleRow.style.gap = "6px";
  titleRow.style.fontWeight = "600";
  titleRow.style.lineHeight = "1.2";
  titleRow.style.color = "#0f172a";
  titleRow.style.minWidth = "0";
  titleRow.appendChild(createIconBadge("T", "#dbeafe", "#1d4ed8"));

  const { viewport: titleViewport } = createMarqueeText(taskTitle);

  titleRow.appendChild(titleViewport);
  root.appendChild(titleRow);

  for (const requirement of skillRequirements) {
    const row = document.createElement("div");
    row.style.display = "grid";
    row.style.gridTemplateColumns = "14px minmax(0, 1fr) auto";
    row.style.alignItems = "center";
    row.style.gap = "6px";
    row.style.lineHeight = "1.2";
    row.style.minWidth = "0";

    row.appendChild(createIconBadge("S", "#dcfce7", "#15803d"));

    const { viewport: skillViewport } = createMarqueeText(requirement.skillName, "#166534");
    row.appendChild(skillViewport);

    const peopleWrap = document.createElement("span");
    peopleWrap.style.display = "inline-flex";
    peopleWrap.style.alignItems = "center";
    peopleWrap.style.gap = "4px";
    peopleWrap.style.color = "#6b21a8";
    peopleWrap.style.flexShrink = "0";

    peopleWrap.appendChild(createIconBadge("P", "#f3e8ff", "#7e22ce"));

    const peopleCount = document.createElement("span");
    peopleCount.textContent = requirement.quantity > 0 ? String(requirement.quantity) : "-";
    peopleWrap.appendChild(peopleCount);

    row.appendChild(peopleWrap);
    root.appendChild(row);
  }

  return root;
}

function buildTimelineItemTitle(item: ScheduleItem, skillRequirements: DisplaySkillRequirement[], assigneeNames: string): string {
  const skillLines = skillRequirements.map((requirement) => `Skill: ${requirement.skillName} | People: ${requirement.quantity > 0 ? requirement.quantity : "-"}`);
  const baseLines = [item.title, ...skillLines];
  if (assigneeNames) {
    baseLines.push(`Assignees: ${assigneeNames}`);
  }
  return baseLines.join("\n");
}


export function TimelineCanvas({
  items,
  members,
  enableDrag = false,
  groupMode = "none",
  onMoveItem,
  onDropTask,
  className,
}: TimelineCanvasProps) {
  // Mutable refs for async-safe callbacks — updated on every render without
  // re-mounting the Timeline.
  const onMoveItemRef = useRef(onMoveItem);
  const onDropTaskRef = useRef(onDropTask);
  // Timeline instance obtained via onReady — used by drag-drop and rangechanged handlers.
  const timelineInstanceRef = useRef<Timeline | null>(null);
  // Mount-guard: prevents async callbacks from firing after component unmounts.
  const isMountedRef = useRef(true);
  // Wrapper ref for drag-drop event attachment.
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { onMoveItemRef.current = onMoveItem; }, [onMoveItem]);
  useEffect(() => { onDropTaskRef.current = onDropTask; }, [onDropTask]);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // ── Data derivation ─────────────────────────────────────────────────────────

  const membersMap = useMemo(
    () => new Map(members.map((member) => [member.id, member.name])),
    [members],
  );
  const skillNameBySlug = useMemo(
    () => new Map(SKILLS.map((skill) => [skill.slug, skill.name])),
    [],
  );
  const workspaceIdByItemId = useMemo(
    () => new Map(items.map((item) => [item.id, item.workspaceId])),
    [items],
  );
  // Always-current mirror of workspaceIdByItemId for the onMove closure.
  // onMove uses workspaceIdByItemIdRef.current instead of closing over the
  // memoized value directly, so timelineOptions does NOT need workspaceIdByItemId
  // in its dependency array — changes to it are always visible via the ref.
  const workspaceIdByItemIdRef = useRef(workspaceIdByItemId);
  useEffect(() => { workspaceIdByItemIdRef.current = workspaceIdByItemId; }, [workspaceIdByItemId]);

  const timelineItems = useMemo(() => {
    return items
      .map((item): DataItem | null => {
        const interval = resolveTimelineInterval(item);
        if (!interval) return null;
        const assigneeNames = item.assigneeIds
          .map((id) => membersMap.get(id))
          .filter(Boolean)
          .join(", ");
        const skillRequirements = formatSkillRequirements(item, skillNameBySlug);
        const titleText = buildTimelineItemTitle(item, skillRequirements, assigneeNames);

        const timelineItem: TimelineRenderableItem = {
          id: item.id,
          content: item.title,
          taskTitle: item.title,
          skillRequirements,
          start: interval.start,
          end: interval.end,
          type: interval.type,
          group: groupMode === "workspace" ? item.workspaceId : undefined,
          title: escapeHtml(titleText),
          className: toTimelineClassName(item),
        };

        return timelineItem;
      })
      .filter((item): item is DataItem => item !== null);
  }, [groupMode, items, membersMap, skillNameBySlug]);

  const timelineGroups = useMemo<DataGroup[] | undefined>(() => {
    if (groupMode !== "workspace") return undefined;

    const seen = new Set<string>();
    const groups: DataGroup[] = [];
    for (const item of items) {
      if (seen.has(item.workspaceId)) continue;
      seen.add(item.workspaceId);
      groups.push({
        id: item.workspaceId,
        content: escapeHtml(item.workspaceName ?? item.workspaceId),
        title: escapeHtml(item.workspaceName ?? item.workspaceId),
      });
    }
    return groups;
  }, [groupMode, items]);

  // Capture the initial visible window at mount time. start/end are intentionally
  // excluded from timelineOptions to prevent the view from jumping when items change.
  const initialWindowRef = useRef(resolveInitialWindow(timelineItems));

  // ── Timeline options ────────────────────────────────────────────────────────
  // Rebuild when interactive options or the workspace-group data change.
  // The template and onMove closures capture groupMode/workspaceIdByItemId/refs.
  const timelineOptions = useMemo(() => ({
    stack: true,
    groupHeightMode: "fitItems",
    verticalScroll: true,
    selectable: true,
    moveable: enableDrag,
    editable: enableDrag ? { updateTime: true, updateGroup: false } : false,
    zoomMin: 1000 * 60 * 15,
    zoomMax: 1000 * 60 * 60 * 24 * 90,
    zoomFriction: 8,
    throttleRedraw: 32,
    timeAxis: { scale: "day", step: 1 },
    snap: null,
    margin: { item: 12, axis: 8 },
    orientation: { axis: "top" },
    showCurrentTime: false,
    groupOrder: "content",
    template: (rawItem: unknown): HTMLElement => {
      const item = rawItem as TimelineRenderableItem | undefined;
      const taskTitle = typeof item?.taskTitle === "string" ? item.taskTitle : "Untitled";
      const skillRequirements = Array.isArray(item?.skillRequirements)
        ? (item.skillRequirements as DisplaySkillRequirement[])
        : [];
      return buildTimelineItemElement(taskTitle, skillRequirements);
    },
    onMove: (movedItem: TimelineItem, callback: (item: TimelineItem | null) => void): void => {
      const startDate = new Date(movedItem.start);
      const endDate = movedItem.end ? new Date(movedItem.end) : new Date(startDate);

      if (groupMode === "workspace") {
        const sourceWorkspaceId = workspaceIdByItemId.get(String(movedItem.id));
        const targetWorkspaceId = movedItem.group != null ? String(movedItem.group) : undefined;
        if (sourceWorkspaceId && targetWorkspaceId && sourceWorkspaceId !== targetWorkspaceId) {
          if (isMountedRef.current) callback(null);
          return;
        }
      }

      const moveHandler = onMoveItemRef.current;
      if (!moveHandler) {
        if (isMountedRef.current) callback(movedItem);
        return;
      }

      moveHandler({
        itemId: String(movedItem.id),
        start: startDate,
        end: endDate,
        groupId: movedItem.group != null ? String(movedItem.group) : undefined,
      })
        .then((ok) => {
          if (!isMountedRef.current) return;
          callback(ok ? movedItem : null);
        })
        .catch(() => {
          if (!isMountedRef.current) return;
          callback(null);
        });
    },
  }), [enableDrag, groupMode, workspaceIdByItemId]);

  // ── Timeline ready handler ──────────────────────────────────────────────────
  const handleTimelineReady = useCallback((tl: Timeline) => {
    timelineInstanceRef.current = tl;

    // Set the initial visible window once — does not re-apply when items change,
    // so the user's navigation position is preserved across data updates.
    tl.setWindow(
      initialWindowRef.current.start,
      initialWindowRef.current.end,
      { animation: false },
    );

    // Debounced redraw on range-pan/zoom (matching original requestAnimationFrame approach).
    let redrawFrame: number | null = null;
    tl.on("rangechanged", () => {
      if (redrawFrame !== null) cancelAnimationFrame(redrawFrame);
      redrawFrame = requestAnimationFrame(() => {
        redrawFrame = null;
        tl.redraw();
      });
    });
    tl.redraw(); // kick off the first layout pass after mount
  }, []);

  // ── Drag-and-drop handlers ──────────────────────────────────────────────────
  const handleDragOver = useCallback((event: DragEvent) => {
    if (!event.dataTransfer) return;
    if (event.dataTransfer.types.includes("application/x-workspace-task")) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const handleDrop = useCallback(async (event: DragEvent) => {
    if (!event.dataTransfer) return;
    const payload = event.dataTransfer.getData("application/x-workspace-task");
    if (!payload) return;

    event.preventDefault();

    let parsed: { taskId?: string } | null = null;
    try {
      parsed = JSON.parse(payload) as { taskId?: string };
    } catch {
      return;
    }
    if (!parsed?.taskId) return;

    const tl = timelineInstanceRef.current;
    const dropHandler = onDropTaskRef.current;
    if (!tl || !dropHandler) return;

    const eventProps = tl.getEventProperties(event as unknown as Event);
    const dropTime = eventProps.time;
    if (!(dropTime instanceof Date) || Number.isNaN(dropTime.getTime())) return;

    await dropHandler({ taskId: parsed.taskId, droppedAt: dropTime });
  }, []);

  // Attach drag-drop to wrapper div so the drop target covers the full component area.
  useEffect(() => {
    const container = wrapperRef.current;
    if (!container) return;
    container.addEventListener("dragover", handleDragOver as unknown as EventListener);
    container.addEventListener("drop", handleDrop as unknown as EventListener);
    return () => {
      container.removeEventListener("dragover", handleDragOver as unknown as EventListener);
      container.removeEventListener("drop", handleDrop as unknown as EventListener);
    };
  }, [handleDragOver, handleDrop]);

  return (
    <div ref={wrapperRef} className={cn("relative min-h-[520px] rounded-xl border bg-card p-3", className)}>
      <VisTimelineCanvas
        items={timelineItems}
        groups={timelineGroups}
        options={timelineOptions as TimelineOptions}
        onReady={handleTimelineReady}
        className="min-h-[500px] w-full"
      />
    </div>
  );
}
