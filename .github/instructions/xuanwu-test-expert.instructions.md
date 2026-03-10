---
name: "Xuanwu Test Expert Rules"
description: "Rules for Next.js preflight + next-devtools structure sensing, realtime status/metadata diagnostics, and minimal automated fixes."
applyTo: "**/*xuanwu-test-expert*.{md,yml,yaml,json}"
---

# Xuanwu Test Expert Rules

## Scope

- Applies to `xuanwu-test-expert` agent, prompt, and skill assets.
- This file is the canonical execution contract for those assets.

## Execution contract

- MUST start dev server with `npm run dev` in background mode for preflight tasks.
- MUST run `next-devtools-nextjs_index` before deep diagnostics to capture project structure/runtime context.
- MUST open `http://localhost:9002` in VS Code integrated browser.
- MUST run `next-devtools-nextjs_call` for realtime runtime checks when errors are suspected.
- MUST include metadata analysis (at least title + canonical/robots/locale-related metadata where applicable).
- MUST report startup status, page URL, page title, and diagnostics summary.
- MUST return `BLOCKED` with blocker details if startup or navigation fails.

## Tool separation and Playwright discipline

- MUST use `playwright-browser_*` tools for browser actions and evidence capture.
- MUST use `next-devtools-*` tools for Next.js server/runtime diagnostics.
- MUST call `playwright-browser_snapshot` after each navigation before interacting with page refs.
- MUST use refs from the most recent snapshot only.
- MUST NOT use browser-eval DOM execution for steps covered by Playwright snapshot workflow.

## Automated code generation and fix

- MAY auto-generate or auto-fix code only when diagnostics point to a specific root cause.
- MUST keep fixes minimal and constrained to affected scope.
- MUST revalidate after fixes (browser + diagnostics) before claiming success.
- MUST report changed files and verification outcome.

## Safety and quality

- MUST NOT expose secrets from `.env` or `.env.local`.
- MUST keep outputs concise and reproducible.
- SHOULD suggest one concrete next action after reporting status.
- SHOULD prioritize next-devtools diagnostics over speculative refactoring.

## References

- `docs/copilot/customization/custom-agents.md`
- `docs/copilot/customization/prompt-files.md`
- `docs/copilot/customization/agent-skills.md`
