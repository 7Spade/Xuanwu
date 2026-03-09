/**
 * Module: nexus-breadcrumb
 * Purpose: Provide a reusable breadcrumb renderer with optional terminal page segment.
 * Responsibilities: map breadcrumb model to shadcn breadcrumb primitives.
 * Constraints: deterministic logic, respect module boundaries
 */
import Link from "next/link"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shadcn-ui/breadcrumb"

interface BreadcrumbNode {
  href?: string
  label: string
}

interface NexusBreadcrumbProps {
  items: BreadcrumbNode[]
}

export function NexusBreadcrumb({ items }: NexusBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <BreadcrumbItem key={`${item.label}-${index}`}>
              {isLast || !item.href ? (
                <BreadcrumbPage className="tracking-tight">{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
              {!isLast ? <BreadcrumbSeparator /> : null}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
