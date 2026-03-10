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
   - tool separation rule: browser interactions via `playwright-browser_*`; server diagnostics via `next-devtools-*`
5. Apply Playwright execution discipline on every interacted route:
   - `playwright-browser_navigate`
   - `playwright-browser_snapshot` (refresh refs)
   - interaction (`click`/`fill_form`/`type`)
   - `playwright-browser_snapshot`
   - `playwright-browser_console_messages`
   - `playwright-browser_take_screenshot`
   - never use stale refs from older snapshots
6. If issue is confirmed and localized, generate and apply minimal code fix.
7. Re-validate with browser + next-devtools and return:
   - terminal status (started/failed)
   - page URL
   - page title
   - fixed/not fixed state
8. Include coverage status matrix with route state labels: `PASS`, `FAIL`, `BLOCKED`, `EXPECTED_GATED`.
9. If blocked, return exact blocker and a safe retry suggestion.

## Output format

- `status`: `PASS` or `BLOCKED`
- `server`: short startup summary
- `structure`: next-devtools index summary (app root, key routes, active server)
- `diagnostics`: runtime + metadata findings
- `autofix`: patch summary and affected files, or `SKIPPED` with reason
- `coverage`: route matrix with `covered/total`, `missing`, and status labels
- `browser`: `url` + `title`
- `next_step`: one concrete follow-up action
