---
name: xuanwu-test-expert
description: "Run the canonical Xuanwu Next.js preflight and diagnostics flow, including runtime checks, route audits, next-devtools inspection, metadata analysis, and minimal root-cause remediation."
agent: "xuanwu-test-expert"
---

# Xuanwu Test Expert Prompt

Execute a local Next.js diagnostic preflight for this workspace.

Normative execution contract: [xuanwu-test-expert.instructions.md](../instructions/xuanwu-test-expert.instructions.md)

## Consolidated scope

This is the canonical Xuanwu prompt for the repository's former runtime-diagnostics variants:

- full Next.js diagnostics
- focused next-devtools checks
- route rendering and slot audit
- browser verification with metadata capture

## Required execution

1. Follow the instruction contract exactly, including startup, next-devtools diagnostics, Playwright snapshot discipline, metadata checks, and revalidation.
2. Keep fixes minimal and localized; skip speculative refactors.
3. If blocked, return exact blocker and one safe retry suggestion.

## Output format

- `status`: `PASS` or `BLOCKED`
- `server`: short startup summary
- `structure`: next-devtools index summary (app root, key routes, active server)
- `diagnostics`: runtime + metadata findings
- `autofix`: patch summary and affected files, or `SKIPPED` with reason
- `coverage`: route matrix with `covered/total`, `missing`, and status labels
- `browser`: `url` + `title`
- `next_step`: one concrete follow-up action
