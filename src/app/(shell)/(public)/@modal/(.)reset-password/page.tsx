/**
 * Module: reset-password-modal-page
 * Purpose: Render reset password flow in an intercepting modal route.
 * Responsibilities: read optional email query param and close modal through router back navigation.
 * Constraints: deterministic logic, respect module boundaries
 */
// [職責] Intercepting route — renders ResetPasswordForm as Dialog overlay from within login page
// Client nav: modal overlay; direct URL: falls through to (auth)/reset-password/page.tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { useI18n } from "@/app-runtime/providers/i18n-provider"
import { ResetPasswordForm } from "@/features/identity.slice"
import { NexusDialogShell } from "@/lib-ui/custom-ui"

function ResetPasswordModalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()

  return (
    <NexusDialogShell
      open
      onOpenChange={() => router.back()}
      title={t("auth.resetPassword")}
      description={t("auth.sendEmail")}
      contentClassName="max-w-sm p-6 sm:p-8"
      titleClassName="font-headline"
      bodyClassName="pt-2"
    >
      <ResetPasswordForm
        defaultEmail={searchParams.get("email") ?? ""}
        onSuccess={() => router.back()}
        onCancel={() => router.back()}
      />
    </NexusDialogShell>
  )
}

export default function ResetPasswordModalPage() {
  return (
    <Suspense>
      <ResetPasswordModalContent />
    </Suspense>
  )
}
