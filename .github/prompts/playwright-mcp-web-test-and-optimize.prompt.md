---
name: playwright-mcp-web-test-and-optimize
agent: 'agent'
description: 'Run browser verification with Playwright MCP and combine with next-devtools diagnostics for root-cause-safe fixes.'
---

# Integrated Test, Diagnose, Fix & Optimize

Use Playwright for browser truth and next-devtools for Next.js runtime truth.

## Recommended skills
- `webapp-testing`: Browser flow validation, interaction checks, and evidence capture.
- `next-best-practices`: App Router boundary and rendering-safe fix patterns.
- `next-cache-components`: Cache Components diagnostics when route data/render behavior is unstable.
- `chrome-devtools`: Optional deeper browser-side investigation for console/network/perf anomalies.

## Standard flow
1. Baseline: login + key route checks
2. Capture console/network/screenshot evidence
3. Use next-devtools for server/runtime diagnostics
4. Apply minimal fixes
5. Re-run affected checks

## Localhost target (Xuanwu)
- Base URL for this repository: `http://localhost:9002`
- Start command: `npm run dev`
- Required preflight: confirm `localhost:9002` is reachable before any browser step.
- PowerShell check: `Test-NetConnection -ComputerName localhost -Port 9002`
- If unreachable: restart dev server and retry preflight once, then classify as environment blocker.

## Optimized execution pipeline (localhost:9002)
1. Preflight
	- Verify server reachability on `9002`.
	- Open base URL and confirm landing UI renders.
2. Authentication baseline
	- Execute login flow using `.env.local` test credentials.
	- Verify `/dashboard` shell is truly rendered.
3. Navigation coverage
	- Execute dashboard/sidebar route tour (all sidebar tabs).
	- Execute workspace tab route tour (all workspace tabs).
	- For every tab page, execute nested tab tour (all visible sub-tabs).
4. Evidence and diagnosis
	- Collect snapshot + screenshot + console/network anomalies per failed route.
	- Use next-devtools runtime diagnostics for server-side root cause.
5. Fix and verify
	- Apply minimal boundary-safe fix.
	- Re-run only affected flows, then regression-check auth + shell + routing.

## Completion gate
- The run is complete only when all mandatory flows are either:
	- `PASS` with evidence, or
	- `BLOCKED` with reproducible environment proof.
- Tab coverage is complete only when sidebar tabs and nested tabs are both fully covered.
- Any hydration mismatch console error is a hard failure and must be fixed or marked `BLOCKED` with reproducible evidence before completion.

## Sidebar and Nested Tab Coverage Rule (Mandatory)
1. Open every visible sidebar tab at least once.
2. On each opened tab page, open every visible nested tab/sub-tab at least once.
3. Repeat coverage when context changes (`Personal` vs `Organization`, different workspaces).
4. Save one artifact per tab level (snapshot or screenshot) with route evidence.
5. Report a coverage matrix in output: `sidebar tab -> nested tabs -> PASS/FAIL/BLOCKED`.
6. Report two top-level matrices: `Personal context` and `Organization context`.
7. For governance-only pages in personal context, use `EXPECTED_GATED` status and include gating evidence.

## Local test credentials
- Read credentials from project-root `.env.local`.
- Required variables: `TEST_AUTH_EMAIL`, `TEST_AUTH_PASSWORD`.
- Do not place credentials in `.github/copilot-instructions.md`.

## Login verification flow
1. Open `/` and confirm top-right controls are visible: language switcher + sign-in button.
2. If language menu is open, close/select an item first to avoid click interception.
3. Click sign-in to open auth dialog.
4. Fill email/password from `.env.local` using `TEST_AUTH_EMAIL` and `TEST_AUTH_PASSWORD`.
5. Submit login and wait for navigation.
6. Verify final URL is `/dashboard` and dashboard shell content is rendered (sidebar + main content), not only URL change.
7. Capture one snapshot after login as evidence.
8. If login fails, collect console errors + failed requests + screenshot before attempting fixes.

## Organization and workspace flow verification
1. On `/dashboard`, verify header contains the top-right i18n button (`Switch language`).
2. Open account switcher and change `Personal` <-> `Organization`; verify account label updates.
3. In `Organization` context, confirm `Quick Access` workspaces are visible.
4. Enter workspace by clicking one workspace quick link (`/workspaces/{id}`).
5. Verify workspace route loaded and header still contains top-right i18n button.
6. Switch to another workspace from quick links.
7. Verify URL changes to the second workspace id and workspace page remains interactive.
8. Capture one screenshot for each milestone: switched organization, entered workspace, switched workspace.

## Full project walkthrough (required route tour)
1. Verify left sidebar routes are each opened at least once:
	- `/dashboard`
	- `/workspaces`
	- `/dashboard/account/members`
	- `/dashboard/account/teams`
	- `/dashboard/account/partners`
	- `/dashboard/account/matrix`
	- `/dashboard/account/workforce-scheduling`
	- `/dashboard/account/daily`
	- `/dashboard/account/audit`
2. Inside one workspace, open each tab route at least once:
	- `Capabilities`
	- `Members`
	- `Tasks`
	- `QA`
	- `Acceptance`
	- `Finance`
	- `Issues`
	- `Daily`
	- `Files`
	- `Schedule`
	- `Document Parser`
	- `Audit`
3. For each opened workspace tab, open all nested tabs/sub-tabs on that page before continuing.
4. Confirm top-right i18n button exists on both dashboard shell and workspace shell during the tour.
5. If `Restoring dimension sovereignty...` blocks navigation, re-authenticate and retry once; if still blocked, record it as environment blocker with console/network evidence.

## Output
- Repro steps
- Evidence (errors/screenshots)
- Fix summary and verification results
- Full coverage matrix for sidebar tabs, nested tabs, and global navigation links
- Coverage summary with `covered/total` and explicit `missing` counts per route group

## Hydration mismatch verification (mandatory)
1. After each major route group (dashboard shell, workspace shell), collect console logs.
2. If logs include `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties`, classify route group as `FAIL`.
3. Run root-cause checks for SSR/CSR branch divergence, random/time-based render values, and unstable generated IDs.
4. Re-run affected routes and keep final artifact showing mismatch removed.
