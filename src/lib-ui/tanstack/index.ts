/**
 * Module: tanstack-index
 * Purpose: Public barrel for lib-ui TanStack building blocks.
 * Responsibilities: re-export react-query, react-table, react-virtual, react-form contracts.
 * Constraints: deterministic logic, respect module boundaries
 */
export { TanstackQueryProvider } from "./query-client-provider"
export { QueryBoundary } from "./query-boundary"
export { DataTable } from "./data-table"
export { VirtualList } from "./virtual-list"
export { TanstackFormField } from "./tanstack-form-field"
