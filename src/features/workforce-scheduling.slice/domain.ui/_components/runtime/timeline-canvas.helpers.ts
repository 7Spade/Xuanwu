/**
 * Module: timeline-canvas.helpers.ts
 * Purpose: Pure data transformation helpers for timeline rendering.
 * Responsibilities: normalize temporal values and derive vis timeline item metadata.
 * Constraints: deterministic logic, respect module boundaries
 */

import { addDays, addMinutes, isSameDay, startOfDay } from "date-fns";

import type { ScheduleItem, Timestamp } from "@/shared-kernel";

type CalendarTimestamp = Timestamp | Date | { seconds: number; nanoseconds: number } | null | undefined;
type ResolvedTemporalKind = NonNullable<ScheduleItem["temporalKind"]>;

type TimestampLike = { toDate: () => Date };

function isTimestampLike(value: unknown): value is TimestampLike {
  if (typeof value !== "object" || value === null || !("toDate" in value)) {
    return false;
  }

  return typeof Reflect.get(value, "toDate") === "function";
}

function hasSecondsField(value: unknown): value is { seconds: number } {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return typeof Reflect.get(value, "seconds") === "number";
}

export function toDate(timestamp: CalendarTimestamp): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (isTimestampLike(timestamp)) return timestamp.toDate();
  if (hasSecondsField(timestamp)) {
    return new Date(timestamp.seconds * 1000);
  }
  return null;
}

export function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function toTimelineClassName(item: ScheduleItem): string {
  switch (item.status) {
    case "PROPOSAL":
      return "bg-primary/10 border-primary/40";
    case "OFFICIAL":
      return "bg-emerald-500/10 border-emerald-500/40";
    case "COMPLETED":
      return "bg-muted border-muted-foreground/30";
    case "REJECTED":
      return "bg-destructive/10 border-destructive/40";
    default:
      return "bg-background border-border";
  }
}

function isStartOfDayTimestamp(date: Date): boolean {
  return (
    date.getHours() === 0 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0 &&
    date.getMilliseconds() === 0
  );
}

function inferTemporalKind(start: Date, end?: Date, explicitKind?: ScheduleItem["temporalKind"]): ResolvedTemporalKind {
  if (explicitKind) return explicitKind;
  if (!end) return "point";

  if (end.getTime() === start.getTime()) {
    if (isSameDay(start, end) && isStartOfDayTimestamp(start) && isStartOfDayTimestamp(end)) {
      return "allDay";
    }
    return "point";
  }

  if (end.getTime() > start.getTime()) return "range";
  return "point";
}

export function resolveTimelineInterval(item: ScheduleItem): {
  temporalKind: ResolvedTemporalKind;
  start: Date;
  end?: Date;
  type: "box" | "range";
} | null {
  const startValue = toDate(item.startDate);
  const endValue = toDate(item.endDate);
  if (!startValue && !endValue) return null;

  const baseStart = startValue ?? endValue!;
  const baseEnd = endValue ?? startValue ?? undefined;
  const kind = inferTemporalKind(baseStart, baseEnd, item.temporalKind);

  if (kind === "point") {
    return {
      temporalKind: kind,
      start: baseStart,
      type: "box",
    };
  }

  if (kind === "allDay") {
    const normalizedStart = startOfDay(baseStart);
    const normalizedEnd = baseEnd && baseEnd.getTime() > normalizedStart.getTime()
      ? baseEnd
      : addDays(normalizedStart, 1);

    return {
      temporalKind: kind,
      start: normalizedStart,
      end: normalizedEnd,
      type: "range",
    };
  }

  const normalizedEnd = baseEnd && baseEnd.getTime() > baseStart.getTime()
    ? baseEnd
    : addMinutes(baseStart, 30);

  return {
    temporalKind: kind,
    start: baseStart,
    end: normalizedEnd,
    type: "range",
  };
}

export function resolveInitialWindow(items: Array<{ start: Date | string | number }>): { start: Date; end: Date } {
  const now = new Date();
  if (items.length === 0) {
    return {
      start: addDays(now, -3),
      end: addDays(now, 10),
    };
  }

  const itemStarts = items
    .map((item) => {
      const value = item.start;
      return value instanceof Date ? value : new Date(value);
    })
    .sort((left, right) => left.getTime() - right.getTime());

  const nearest = itemStarts.reduce((best, current) => {
    const currentDistance = Math.abs(current.getTime() - now.getTime());
    const bestDistance = Math.abs(best.getTime() - now.getTime());
    return currentDistance < bestDistance ? current : best;
  }, itemStarts[0]);

  return {
    start: addDays(nearest, -3),
    end: addDays(nearest, 10),
  };
}
