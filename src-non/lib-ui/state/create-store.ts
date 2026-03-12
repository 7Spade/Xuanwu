/**
 * Module: create-store
 * Purpose: Provide a typed Zustand store factory following the slice pattern.
 * Responsibilities: export a createStore wrapper that enforces the devtools +
 *   immer-compatible naming convention used across the project.
 * Constraints: deterministic logic, respect module boundaries
 */
import { type StateCreator, create } from "zustand"
import { devtools } from "zustand/middleware"

/**
 * Create a named Zustand store with Redux DevTools integration.
 *
 * @example
 * ```ts
 * interface CounterState {
 *   count: number
 *   increment: () => void
 * }
 *
 * export const useCounterStore = createNamedStore<CounterState>("counter", (set) => ({
 *   count: 0,
 *   increment: () => set((s) => ({ count: s.count + 1 })),
 * }))
 * ```
 */
export function createNamedStore<T extends object>(
  name: string,
  initializer: StateCreator<T, [["zustand/devtools", never]], []>,
) {
  return create<T>()(devtools(initializer, { name }))
}
