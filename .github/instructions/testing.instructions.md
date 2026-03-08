---
description: "Testing workflow split: Playwright MCP for browser flows, next-devtools MCP for Next.js diagnostics."
applyTo: "**/*.{ts,tsx,js,jsx}"
---

# Testing Rules: Playwright MCP + next-devtools MCP

Use Playwright MCP for browser interaction and use next-devtools MCP for Next.js server/runtime diagnostics.

## Critical Rule

- MUST NOT call `browser_eval` with `action: "evaluate"` during a Playwright snapshot workflow.
- MUST use `next-devtools-nextjs_index` and `next-devtools-nextjs_call` for RSC, route, build, and runtime diagnostics.

## Tool Separation

- MUST use `playwright-browser_*` tools for click/type/fill/wait/screenshot/console checks.
- MUST use `next-devtools-*` tools for server diagnostics that do not require browser DOM execution.

## Playwright Execution Rules

- MUST call `playwright-browser_snapshot` after each navigation to refresh `ref` values.
- MUST use current `ref` values for `click`, `type`, and `fill_form` actions.
- SHOULD capture console messages and screenshots for verification artifacts.

## Standard Sequence

1. `playwright-browser_navigate`
2. `playwright-browser_snapshot`
3. `playwright-browser_fill_form` or `playwright-browser_type`
4. `playwright-browser_click`
5. `playwright-browser_wait_for`
6. `playwright-browser_snapshot`
7. `playwright-browser_console_messages`
8. `playwright-browser_take_screenshot`
9. Optional: `next-devtools-nextjs_call` for server-side diagnostics

## Minimum Route Coverage

- `/login`
- `/dashboard`
- `/dashboard/account/settings`
- `/dashboard/workspaces`
- At least one `/dashboard/workspaces/[id]` reached via UI navigation
