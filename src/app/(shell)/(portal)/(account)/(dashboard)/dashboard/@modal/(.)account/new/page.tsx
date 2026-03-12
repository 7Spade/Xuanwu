/**
 * Module: account-new-modal-page
 * Purpose: Render account creation form in an intercepting modal route.
 * Responsibilities: open/close modal via router back navigation and delegate form actions.
 * Constraints: deterministic logic, respect module boundaries
 */
// [職責] Intercepting route — renders AccountNewForm as Dialog overlay from within dashboard
// Client nav: modal overlay; direct URL: falls through to dashboard/account/new/page.tsx
"use client"

import { useRouter } from "next/navigation"

import { useI18n } from "@/app-runtime/providers/i18n-provider"
import { AccountNewForm } from "@/features/organization.slice"
import { NexusDialogShell } from "@/lib-ui/custom-ui"

export default function AccountNewModalPage() {
  const router = useRouter()
  const { t } = useI18n()

  return (
    <NexusDialogShell
      open
      onOpenChange={() => router.back()}
      title={t("dimension.createTitle")}
      description={t("dimension.createDescription")}
      titleClassName="font-headline"
    >
      <AccountNewForm onSuccess={() => router.back()} onCancel={() => router.back()} />
    </NexusDialogShell>
  )
}
