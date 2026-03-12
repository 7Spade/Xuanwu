/**
 * Portal Layout — Auth Guard for Authenticated Routes
 *
 * Responsibility: Gate all portal routes behind authentication.
 * - Shows loading spinner while Firebase auth is initialising.
 * - Redirects unauthenticated users to / once auth is resolved.
 * - Only renders children when a verified user session exists.
 *
 * This guard lives here (not in the parent shell layout) so that public routes
 * (/, and its modal auth UI) under (shell)/(public) remain accessible without
 * an active session.
 */

"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useApp } from "@/app-runtime/providers/app-provider";
import { useAuth } from "@/app-runtime/providers/auth-provider";
import { Skeleton } from "@/shadcn-ui/skeleton";

type PortalLayoutProps = {
  children: ReactNode;
};

export default function PortalLayout({ children }: PortalLayoutProps) {
  const { state } = useAuth();
  const { user, status } = state;
  const { state: appState } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoot = pathname === "/";
  const isAppBootstrapIdle = appState.bootstrapPhase === "idle";
  const hasActiveAccount = Boolean(appState.activeAccount);

  useEffect(() => {
    if (status === "unauthenticated" && !isPublicRoot) {
      router.replace("/");
    }
  }, [isPublicRoot, router, status]);

  if (!isPublicRoot && status === "initializing" && isAppBootstrapIdle && !hasActiveAccount) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 rounded-2xl bg-background/75 px-6 py-5 ring-1 ring-zinc-300/50 backdrop-blur-sm dark:ring-white/10">
        <Skeleton className="h-4 w-56 rounded-md" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl opacity-90" />
          <Skeleton className="h-20 rounded-xl opacity-80" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" && !isPublicRoot) {
    return null;
  }

  return children;
}
