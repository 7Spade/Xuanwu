/**
 * Module: data-table
 * Purpose: Provide a project-standard styled table built on @tanstack/react-table.
 * Responsibilities: render column headers, body rows, and empty state; apply
 *   project ring/border aesthetics; forward column definitions and row data.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

import { cn } from "@/shadcn-ui/utils/utils"

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  emptyMessage?: string
  className?: string
}

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "No data.",
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl ring-1 ring-zinc-300/50 dark:ring-white/10",
        className,
      )}
    >
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-300/50 dark:border-white/10 bg-muted/40">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left font-medium text-muted-foreground tracking-tight"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-zinc-300/30 last:border-0 dark:border-white/5 hover:bg-muted/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
