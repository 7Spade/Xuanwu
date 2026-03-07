
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useI18n } from "@/app-runtime/providers/i18n-provider";
import { useAuth } from "@/app-runtime/providers/auth-provider";
import { Button } from "@/shadcn-ui/button";

/**
 * Home - Responsibility: Serves as the landing page and entry point.
 */
export default function Home() {
  const { state } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    if (state.user) {
      router.push("/dashboard");
    }
  }, [state.user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Button
        aria-label={t('common.enterOrgVerse')}
        variant="ghost"
        onClick={() => router.push("/login")}
        className="size-auto animate-bounce p-0 text-7xl transition-transform [animation-duration:3000ms] hover:scale-110 hover:bg-transparent"
      >
        🐢
      </Button>
    </div>
  );
}
