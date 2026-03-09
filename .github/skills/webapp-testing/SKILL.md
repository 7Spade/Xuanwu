---
name: webapp-testing
description: Toolkit for interacting with and testing local web applications using Playwright MCP tools. Use when asked to verify frontend functionality, debug UI behavior, capture browser screenshots, check for visual regressions, or view browser console logs. Supports Chrome, Firefox, and WebKit browsers.
---

# Web Application Testing

## Intent
Toolkit for interacting with and testing local web applications using Playwright MCP tools. Use when asked to verify frontend functionality, debug UI behavior, capture browser screenshots, check for visual regressions, or view browser console logs. Supports Chrome, Firefox, and WebKit browsers.

## Inputs
- User goal and expected deliverable
- Relevant repository context or existing artifacts
- Constraints (time, scope, quality, security/compliance)

## Local Test Account
- Use project-root `.env.local` for login-based test runs.
- Credential env vars: `TEST_AUTH_EMAIL`, `TEST_AUTH_PASSWORD`.
- Current local dev values: `test@demo.com` / `123456`.
- Keep credentials out of `.github/copilot-instructions.md`.

## Localhost 9002 Execution Profile (Xuanwu)
- Base URL: `http://localhost:9002`
- Start server: `npm run dev`
- Port check (PowerShell): `Test-NetConnection -ComputerName localhost -Port 9002`
- Continue only when `TcpTestSucceeded` is `True`.
- If `False`: restart dev server, then re-check once before marking environment blocker.

## Playwright MCP Run Sequence (localhost:9002)
1. Open `http://localhost:9002`.
2. Confirm landing controls are visible: language switcher and sign-in button.
3. Run mandatory login flow with `.env.local` credentials.
4. Run mandatory organization/workspace flow.
5. Run mandatory full route tour, including all sidebar tabs and nested tabs.
6. Capture artifacts for each phase: snapshot + console anomalies + one screenshot.
7. Report route-level status as `PASS`, `FAIL`, or `BLOCKED`.

## Sidebar and Nested Tab Coverage Rule (Mandatory)
1. Sidebar tabs: every visible sidebar navigation tab must be opened at least once.
2. Nested tabs: for each parent tab page, open every visible child tab/sub-tab at least once.
3. Dynamic tabs: if a tab list changes by account/workspace context, run coverage for each context.
4. Evidence: each tab level requires at least one artifact (`snapshot` or `screenshot`) with URL/path proof.
5. Reporting: output must include a coverage matrix (`parent tab -> child tabs -> status`).

## Blocker Policy (localhost:9002)
1. If page load fails (`ERR_CONNECTION_REFUSED`), run port check and restart `npm run dev`.
2. If auth/session blocks navigation, re-login once and retry the blocked route once.
3. If still failing, stop retries and record as environment blocker with exact route and evidence.

## Hydration Mismatch Policy (Mandatory)
1. Treat React/Next hydration mismatches as `FAIL`, not warning-only.
2. Match on messages including `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties` and `hydration mismatch`.
3. Do not mark route coverage complete until the mismatch is either fixed or explicitly marked `BLOCKED` with reproducible steps and console evidence.
4. Root-cause candidates must be checked in this order: non-deterministic IDs, SSR/CSR conditional branches, random/time-based values in render, locale-dependent formatting during SSR.

## Login Test Procedure (Mandatory)
1. Start from landing page `/`.
2. Verify top-right language switcher and sign-in button both exist.
3. Close/select language menu before clicking sign-in to prevent overlay click blocking.
4. Open sign-in dialog, input `TEST_AUTH_EMAIL` and `TEST_AUTH_PASSWORD`.
5. Submit and wait for route transition.
6. Assert final page is `/dashboard` with visible dashboard shell nodes (navigation + content area).
7. Record result with one post-login snapshot and key console/network anomalies if any.

## Organization and Workspace Test Procedure (Mandatory)
1. On `/dashboard`, assert top-right i18n button exists in shell header.
2. Open account switcher and switch between `Personal` and `Organization`; assert active account label changes.
3. In `Organization`, assert `Quick Access` workspace links are present.
4. Enter one workspace (`/workspaces/{id}`) through UI link.
5. Assert workspace page renders and top-right i18n button still exists.
6. Switch to a second workspace from UI quick links.
7. Assert route id changed and page is stable/interactable after switch.
8. Record evidence for all three actions: organization switch, workspace entry, workspace switch.

## Full Route Tour Procedure (Mandatory)
1. Traverse left sidebar routes once each:
	- `/dashboard`
	- `/workspaces`
	- `/dashboard/account/members`
	- `/dashboard/account/teams`
	- `/dashboard/account/partners`
	- `/dashboard/account/matrix`
	- `/dashboard/account/workforce-scheduling`
	- `/dashboard/account/daily`
	- `/dashboard/account/audit`
2. In one workspace context, traverse all workspace tab routes once each:
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
3. During traversal, assert top-right i18n button exists in both dashboard and workspace shells.
4. For each workspace tab page, if there are internal tabs/sub-tabs, open all of them once each before moving to the next workspace tab.
5. If blocked by `Restoring dimension sovereignty...`, re-login and retry once; if still blocked, mark as environment blocker and capture console/network evidence.

## Workflow
1. Confirm scope and ask targeted clarifying questions when required.
2. Produce a concise, execution-ready plan focused on the stated goal.
3. Execute the domain-specific work implied by this skill's intent.
4. Validate quality, safety, and completeness before finalizing output.
5. Return concrete results with assumptions, decisions, and next actions.

## Output Contract
- Deliverables must be actionable, deterministic, and easy to review.
- Use clear sections and checklists when they improve execution clarity.
- Keep output concise while preserving all required decisions and risks.

## Guardrails
- Follow repository conventions and existing architecture boundaries.
- Do not expose secrets or sensitive data.
- Flag unresolved risks, dependencies, and follow-up work explicitly.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
