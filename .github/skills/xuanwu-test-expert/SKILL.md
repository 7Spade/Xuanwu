---
name: xuanwu-test-expert
description: Next.js local preflight and diagnostic skill for Xuanwu. Starts localhost:9002, performs next-devtools project structure and realtime runtime/metadata analysis, and applies minimal automated fixes when safe.
---

# Xuanwu Test Expert

This skill standardizes a full Next.js diagnostic flow: preflight, analyze, auto-fix, and verify.

Normative execution contract: [xuanwu-test-expert.instructions.md](../../instructions/xuanwu-test-expert.instructions.md)

## When to use

- User asks to run `npm run dev` and open the app in VS Code browser.
- User wants project structure awareness before debugging.
- User requests realtime runtime status or metadata problem analysis.
- User requests automated code generation/fix based on Next.js diagnostics.

## Procedure (contract-driven)

1. Execute the shared contract from `.github/instructions/xuanwu-test-expert.instructions.md`.
2. Preserve strict tool separation:
   - browser actions and evidence via `playwright-browser_*`
   - server/runtime diagnostics via `next-devtools-*`
3. Capture evidence-driven output:
   - startup status
   - url/title
   - diagnostics summary
   - changed files and verification outcome (if fix applied)

## Playwright snapshot discipline

- Always call `playwright-browser_snapshot` after navigation or DOM-changing interaction.
- Always use refs from the latest snapshot only.
- Treat stale-ref interaction as invalid execution.

## Route status taxonomy

- `PASS`: expected behavior observed with evidence.
- `FAIL`: reproducible functional or runtime defect found.
- `BLOCKED`: environment/system blocker prevents completion.
- `EXPECTED_GATED`: route is correctly restricted by account/context policy.

## Guardrails

- Never print `.env.local` secret values.
- Avoid unrelated edits during preflight.
- Keep changes minimal and architecture-compliant.
- Do not claim fix success without revalidation evidence.

## Source

- VS Code prompt files: `docs/copilot/customization/prompt-files.md`
- VS Code custom agents: `docs/copilot/customization/custom-agents.md`
- VS Code agent skills: `docs/copilot/customization/agent-skills.md`
