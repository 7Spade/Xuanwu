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

import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useApp } from "@/app-runtime/providers/app-provider";
import { useAuth } from "@/app-runtime/providers/auth-provider";

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

  useEffect(() => {
    if (status === "unauthenticated" && !isPublicRoot) {
      router.replace("/");
    }
  }, [isPublicRoot, router, status]);

  if (!isPublicRoot && status !== "unauthenticated" && isAppBootstrapIdle) {
    return (
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3 rounded-2xl bg-background/75 px-6 py-5 ring-1 ring-border/60 backdrop-blur-sm">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Restoring dimension sovereignty...
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" && !isPublicRoot) {
    return null;
  }

  return children;
}
