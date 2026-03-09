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

import { useAuth } from "@/app-runtime/providers/auth-provider";

type PortalLayoutProps = {
  children: ReactNode;
};

export default function PortalLayout({ children }: PortalLayoutProps) {
  const { state } = useAuth();
  const { user, status } = state;
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoot = pathname === "/";

  useEffect(() => {
    if (status === "unauthenticated" && !isPublicRoot) {
      router.replace("/");
      window.location.replace("/");
    }
  }, [isPublicRoot, router, status]);

  if (status === "initializing" && !isPublicRoot) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 bg-background">
        <div className="animate-bounce text-4xl">🐢</div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <Loader2 className="size-3 animate-spin" /> Restoring dimension sovereignty...
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" && !isPublicRoot) {
    return null;
  }

  return children;
}
