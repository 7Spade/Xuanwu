/**
 * Module: machine-provider
 * Purpose: Provide a typed React context/provider pattern for an XState machine actor.
 * Responsibilities: create a machine context with useSelector, useActorRef hooks
 *   and an ActorProvider component so features can consume machine state safely.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client"

import { createContext, useContext, type ReactNode } from "react"
import { createActorContext } from "@xstate/react"
import type { AnyStateMachine } from "xstate"

/**
 * Factory: create a self-contained Actor context+provider for a given XState machine.
 *
 * @example
 * ```ts
 * const { Provider, useActor, useSelector } = createMachineContext(myMachine)
 * ```
 */
export function createMachineContext<T extends AnyStateMachine>(machine: T) {
  return createActorContext(machine)
}

// ---------------------------------------------------------------------------
// Simple guard hook — throws if context is missing (prevents misuse outside provider)
// ---------------------------------------------------------------------------

/** @internal */
export function assertContext<T>(ctx: T | null, name: string): T {
  if (ctx === null) {
    throw new Error(`[lib-ui/state] ${name} must be used within its provider.`)
  }
  return ctx
}

/**
 * Generic non-machine React context factory for use with zustand or simple state.
 * Equivalent to a typed `React.createContext` + useContext pair.
 */
export function createSafeContext<T>(displayName: string) {
  const Ctx = createContext<T | null>(null)
  Ctx.displayName = displayName

  function useSafeContext(): T {
    return assertContext(useContext(Ctx), displayName)
  }

  function SafeProvider({ value, children }: { value: T; children: ReactNode }) {
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>
  }

  return { SafeProvider, useSafeContext }
}
