// [職責] @modal intercept: workspace settings dialog (deep-linkable)
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { WorkspaceSettingsDialog, uploadWorkspaceAvatar, useWorkspace } from "@/features/workspace.slice"
import type { WorkspaceLifecycleState, Address, WorkspacePersonnel } from "@/features/workspace.slice"

export default function WorkspaceSettingsModalPage() {
  const router = useRouter()
  const { workspace, updateWorkspaceSettings } = useWorkspace()
  const [loading, setLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const onSave = async (settings: {
    name: string
    visibility: "visible" | "hidden"
    lifecycleState: WorkspaceLifecycleState
    address?: Address
    personnel?: WorkspacePersonnel
  }) => {
    setLoading(true)
    await updateWorkspaceSettings(settings)
    setLoading(false)
    router.back()
  }

  const onUploadAvatar = async (file: File): Promise<string> => {
    setIsUploadingAvatar(true)
    try {
      return await uploadWorkspaceAvatar(workspace.id, file)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  return (
    <WorkspaceSettingsDialog
      workspace={workspace}
      open
      onOpenChange={(open) => !open && router.back()}
      onSave={onSave}
      onUploadAvatar={onUploadAvatar}
      loading={loading}
      isUploadingAvatar={isUploadingAvatar}
    />
  )
}
