/**
 * Module: state-index
 * Purpose: Public barrel for lib-ui state management building blocks.
 * Responsibilities: re-export XState and Zustand utility contracts.
 * Constraints: deterministic logic, respect module boundaries
 */
export { createMachineContext, createSafeContext } from "./machine-provider"
export { createNamedStore } from "./create-store"
