---
name: xuanwu-test-expert
description: "Run Next.js preflight with next-devtools: structure sensing, realtime status/metadata analysis, and minimal auto-fix with re-validation."
agent: "xuanwu-test-expert"
---

# Xuanwu Test Expert Prompt

Execute a local Next.js diagnostic preflight for this workspace.

## Required steps

1. Start the dev server with `npm run dev` in background mode.
2. Use `next-devtools-nextjs_index` to detect running server, route graph, and available diagnostics.
3. Open `http://localhost:9002` in the VS Code integrated browser.
4. Run realtime diagnostics with `next-devtools-nextjs_call` for:
   - runtime/build health
   - route-level errors
   - metadata correctness (title, canonical, robots, locale-related metadata)
5. If issue is confirmed and localized, generate and apply minimal code fix.
6. Re-validate with browser + next-devtools and return:
   - terminal status (started/failed)
   - page URL
   - page title
   - fixed/not fixed state
7. If blocked, return exact blocker and a safe retry suggestion.

## Output format

- `status`: `PASS` or `BLOCKED`
- `server`: short startup summary
- `structure`: next-devtools index summary (app root, key routes, active server)
- `diagnostics`: runtime + metadata findings
- `autofix`: patch summary and affected files, or `SKIPPED` with reason
- `browser`: `url` + `title`
- `next_step`: one concrete follow-up action
