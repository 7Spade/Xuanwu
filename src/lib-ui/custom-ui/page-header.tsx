/**
 * Module: page-header
 * Purpose: Render a consistent page heading block with compact, high-contrast typography.
 * Responsibilities: align title, description, badge, and action slots across slices.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client";

import type { ReactNode } from "react";

import { cn } from "@/shadcn-ui/utils/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  children?: ReactNode;
  size?: "default" | "compact";
  className?: string;
  actionsClassName?: string;
}

/**
 * PageHeader — shared page-level heading component.
 * Used across all dashboard views for a consistent title/description/action layout.
 */
export function PageHeader({
  title,
  description,
  badge,
  children,
  size = "default",
  className,
  actionsClassName,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end", className)}>
      <div className="space-y-2">
        {badge && <div className="mb-2">{badge}</div>}
        <h1
          className={cn(
            "font-headline font-semibold tracking-tight text-foreground",
            size === "compact" ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
          )}
        >
          {title}
        </h1>
        {description && (
          <p className={cn("max-w-3xl leading-relaxed text-muted-foreground", size === "compact" ? "text-sm" : "text-base")}>
            {description}
          </p>
        )}
      </div>
      <div className={cn("flex flex-wrap items-center gap-3", actionsClassName)}>{children}</div>
    </div>
  );
}
