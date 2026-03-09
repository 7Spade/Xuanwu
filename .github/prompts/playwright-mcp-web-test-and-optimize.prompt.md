---
name: playwright-mcp-web-test-and-optimize
agent: 'agent'
tools: ['playwright-browser_*', 'next-devtools', 'edit/editFiles']
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

## Local test credentials
- Read credentials from project-root `.env.local`.
- Required variables: `TEST_AUTH_EMAIL`, `TEST_AUTH_PASSWORD`.
- Current local dev values: `test@demo.com` / `123456`.
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
3. Confirm top-right i18n button exists on both dashboard shell and workspace shell during the tour.
4. If `Restoring dimension sovereignty...` blocks navigation, re-authenticate and retry once; if still blocked, record it as environment blocker with console/network evidence.

## Output
- Repro steps
- Evidence (errors/screenshots)
- Fix summary and verification results
