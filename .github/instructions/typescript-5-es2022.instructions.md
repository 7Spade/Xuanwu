---
description: "TypeScript 5.x and ES2022 development rules for typing, module boundaries, and correctness."
applyTo: "**/*.{ts,tsx}"
---

# TypeScript 5 / ES2022 Rules

Apply these rules to all `.ts` files.

## Language and Module Rules

- MUST target TypeScript 5.x and ES2022 semantics unless project config states otherwise.
- MUST use ES modules; DO NOT introduce CommonJS syntax.

## Type Safety Rules

- MUST avoid `any` unless explicitly justified at a boundary.
- MUST prefer `unknown` plus narrowing over unsafe casts.
- SHOULD use discriminated unions for stateful workflows and event models.
- SHOULD centralize shared types instead of duplicating structural contracts.

## Naming and Structure Rules

- MUST use semantic names for types, functions, and variables.
- MUST follow project naming conventions (`PascalCase` for types/classes, `camelCase` for values/functions).
- SHOULD keep files and modules single-purpose with explicit public boundaries.

## Error and Async Rules

- MUST use `async/await` for asynchronous flows.
- MUST handle failures with structured errors and clear propagation paths.
- SHOULD apply retry/backoff/cancellation for network and IO operations.

## Security and Configuration Rules

- MUST validate unknown input with type guards or schema validation at boundaries.

## Testing and Quality Rules

- MUST add or update tests for behavior changes.
- SHOULD avoid brittle timing assertions; prefer fake timers/injected clocks.
- MUST run project lint/test/typecheck commands before finalizing changes.

## Documentation Rules

- SHOULD add concise JSDoc for public APIs and non-obvious contracts.
