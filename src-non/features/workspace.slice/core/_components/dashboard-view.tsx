/**
 * Module: dashboard-view.tsx
 * Purpose: Render account dashboard overview composition for root dashboard route.
 * Responsibilities: compose workspace list, audit panel, and permission constellation order.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import { User as UserIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { useAuth } from "@/app-runtime/providers/auth-provider"
import { useI18n } from "@/app-runtime/providers/i18n-provider"
import { PermissionTree } from "@/features/account.slice"
import { AccountGrid } from "@/features/organization.slice"
import { Badge } from "@/shadcn-ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn-ui/card"
import { PageHeader } from "@/lib-ui/custom-ui"

import { AccountAuditComponent } from "../../gov.audit/_components/audit.account-view"
import { useApp } from "../_hooks/use-app"
import { useVisibleWorkspaces } from "../_hooks/use-visible-workspaces"

import { WorkspaceList } from "./workspace-list"


/**
 * DashboardView — The "smart" dashboard overview container.
 * Manages all account/workspace state and delegates rendering to _components/.
 * app/dashboard/page.tsx is now a thin RSC wrapper that renders this.
 */
export function DashboardView() {
  const [mounted, setMounted] = useState(false)
  const { t } = useI18n()

  const { state: appState } = useApp()
  const { state: authState } = useAuth()

  const { accounts, activeAccount } = appState
  const { user } = authState

  const organizationsArray = useMemo(
    () => Object.values(accounts).filter((a) => a.accountType === "organization"),
    [accounts]
  )
  const dimensionWorkspaces = useVisibleWorkspaces()

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeOrganization = useMemo(
    () => (activeAccount?.accountType === "organization" ? accounts[activeAccount.id] : null),
    [accounts, activeAccount]
  )

  const recentOrganizations = useMemo(() => {
    if (!activeOrganization) return []
    return organizationsArray.filter((organization) => organization.id !== activeOrganization.id).slice(0, 3)
  }, [activeOrganization, organizationsArray])

  const currentUserRoleInOrganization = useMemo(() => {
    if (!activeOrganization || !user) return "Guest"
    if (activeOrganization.ownerId === user.id) return "Owner"
    const member = activeOrganization.members?.find((m) => m.id === user.id)
    return member?.role || "Guest"
  }, [activeOrganization, user])

  if (!mounted || !activeAccount) return null

  const isOrganizationContext = activeAccount.accountType === "organization" && activeOrganization

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20 duration-700 animate-in fade-in">
      <PageHeader
        title={activeAccount.name}
        description={
          isOrganizationContext
            ? t("settings.dimensionManagementDescription")
            : t("settings.personalDimensionDescription")
        }
      >
        {isOrganizationContext && (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/50 bg-muted/40 p-3 shadow-sm backdrop-blur-sm sm:gap-6 sm:p-4">
            <div className="border-border/50 px-3 text-center sm:border-r sm:px-4">
              <p className="font-headline text-2xl font-bold">{dimensionWorkspaces.length}</p>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">{t('workspaces.workspaceNodes')}</p>
            </div>
            <div className="px-3 text-center sm:px-4">
              <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">{t('workspaces.yourRole')}</p>
              <Badge className="border-primary/20 bg-primary/10 font-headline text-primary">
                {currentUserRoleInOrganization}
              </Badge>
            </div>
          </div>
        )}
      </PageHeader>

      {!isOrganizationContext && (
        <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-accent/20 bg-accent/5 px-6 py-10 text-center sm:p-8">
          <UserIcon className="mb-4 size-12 text-accent/50 sm:size-16" />
          <h3 className="font-headline text-xl font-bold">{t('workspaces.personalDimension')}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t('workspaces.personalDimensionHelp')}
          </p>
        </div>
      )}

      {isOrganizationContext && (
        <>
          {recentOrganizations.length > 0 ? <AccountGrid accounts={recentOrganizations} /> : null}
        </>
      )}

      <div className={`grid grid-cols-1 ${isOrganizationContext ? "lg:grid-cols-2" : ""} gap-8`}>
        <WorkspaceList workspaces={dimensionWorkspaces} />
        {isOrganizationContext && (
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-headline text-xl font-bold tracking-tight">
                {t('navigation.audit')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[32rem] overflow-y-auto pr-2">
                <AccountAuditComponent />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {isOrganizationContext && <PermissionTree currentRole={currentUserRoleInOrganization} t={t} />}
    </div>
  )
}
