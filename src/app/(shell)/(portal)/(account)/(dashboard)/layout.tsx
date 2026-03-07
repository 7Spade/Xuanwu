import type { ReactNode } from "react"

export default function DashboardGroupLayout({
  children,
  analytics,
  reports,
}: {
  children: ReactNode
  analytics: ReactNode
  reports: ReactNode
}) {
  return (
    <>
      {children}
      {analytics}
      {reports}
    </>
  )
}
