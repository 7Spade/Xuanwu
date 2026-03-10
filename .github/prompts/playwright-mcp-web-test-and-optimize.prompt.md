---
name: playwright-mcp-web-test-and-optimize
agent: 'agent'
description: 'Autonomously start the dev server, open a browser, register a new account, log in, and run full Playwright MCP browser verification combined with next-devtools diagnostics for root-cause-safe fixes.'
tools:
  - 'playwright-browser/*'
  - 'next-devtools/*'
  - 'chrome-devtools/*'
  - 'bash'
  - 'vscode'
---

# Autonomous Test, Diagnose, Fix & Optimize

Use #tool:playwright-browser_navigate and related Playwright tools for browser truth,
#tool:bash for dev-server lifecycle, and #tool:next-devtools for Next.js runtime truth.

Run every phase below fully autonomously — do not ask for human confirmation between steps
unless an unrecoverable blocker is encountered.

## Recommended skills
- `webapp-testing`: Browser flow validation, interaction checks, and evidence capture.
- `next-best-practices`: App Router boundary and rendering-safe fix patterns.
- `next-cache-components`: Cache Components diagnostics when route data/render behavior is unstable.
- `chrome-devtools`: Deeper browser-side investigation for console/network/perf anomalies.

---

## Phase 0 — Autonomous dev-server bootstrap

> **Goal:** ensure `localhost:9002` is serving before any browser step.
> **Prerequisite:** `curl` must be available (standard on macOS/Linux; on Windows use Git Bash, WSL, or the PowerShell alternative shown below).

1. Check reachability with #tool:bash (Unix/macOS):
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:9002 2>/dev/null || echo "UNREACHABLE"
   ```
   On Windows PowerShell:
   ```powershell
   try { (Invoke-WebRequest -Uri http://localhost:9002 -UseBasicParsing -TimeoutSec 3).StatusCode } catch { "UNREACHABLE" }
   ```
2. If the response is not `200`/`30x` (or is `UNREACHABLE`), start the dev server in the background with output captured to a log file:
   ```bash
   npm run dev > /tmp/dev-server.log 2>&1 &
   echo "DEV_SERVER_PID=$!"
   ```
   Record the printed PID for cleanup after testing.
3. Poll until ready (retry every 3 s, max 60 s):
   ```bash
   for i in $(seq 1 20); do
     code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9002 2>/dev/null || echo "000")
     [ "$code" != "000" ] && echo "READY $code" && break
     echo "Waiting... attempt $i/20"
     sleep 3
   done
   ```
4. If the server does not become ready within 60 s, print the last 30 lines of `/tmp/dev-server.log` for diagnosis, report `ENVIRONMENT_BLOCKER: dev server failed to start`, and stop.
5. If the server was already running (step 1 returned 200/30x), log `SERVER_ALREADY_RUNNING` and continue.
6. After all testing phases complete, if the server was started by this run, clean it up:
   ```bash
   kill $DEV_SERVER_PID 2>/dev/null || true
   ```

---

## Phase 1 — Autonomous browser open & landing verification

1. Use #tool:playwright-browser_navigate to open `http://localhost:9002`.
2. Use #tool:playwright-browser_snapshot to capture the a11y tree — this snapshot is the source of truth for steps 3–5.
3. Using the snapshot from step 2, verify the landing page renders top-right controls: language switcher + sign-in button (look for elements by their accessible role or visible text, e.g. `role=button name="Sign in"` or `role=button name="Switch language"`).
4. Use #tool:playwright-browser_take_screenshot and label it `01-landing.png`.
5. If the page does not render or controls are absent from the snapshot, collect #tool:playwright-browser_console_messages and #tool:playwright-browser_network_requests before escalating to `BLOCKED`.

---

## Phase 2 — Autonomous registration (sign-up) flow

> **Goal:** create a fresh test account for this session so tests are not dependent on a pre-existing account state.

1. Read registration credentials from `.env.local`:
   - `TEST_REGISTER_EMAIL` (optional; if absent, auto-generate as `test+<unix-timestamp>@xuanwu.test`)
   - `TEST_REGISTER_PASSWORD` (optional; if absent, auto-generate as `TestPass!<unix-timestamp>`)
   - `TEST_REGISTER_DISPLAY_NAME` (optional; fallback: `Test User`)
2. On the landing page, locate the **Sign Up / Register** control using #tool:playwright-browser_snapshot and search for a button or link with accessible role `button` or `link` and text matching `Sign Up`, `Register`, or `Create account` (case-insensitive). Use the exact `ref` from the snapshot.
3. Click the identified element with #tool:playwright-browser_click.
4. If a modal/dialog opens, wait for it with #tool:playwright-browser_wait_for.
5. Fill the registration form using #tool:playwright-browser_fill_form; use field `ref` values from #tool:playwright-browser_snapshot:
   - Email → resolved `TEST_REGISTER_EMAIL` value
   - Password → resolved `TEST_REGISTER_PASSWORD` value
   - Display name → resolved `TEST_REGISTER_DISPLAY_NAME` value (only if the field exists in the snapshot)
6. Submit the registration form (locate submit button by `role=button` and text `Register`/`Sign Up`/`Create account`).
7. Observe post-submit behavior:
   - If redirected to email-verification page: record URL + screenshot, mark step as `VERIFY_EMAIL_REQUIRED`, and proceed to Phase 3 using `.env.local` `TEST_AUTH_EMAIL`/`TEST_AUTH_PASSWORD` credentials (these must be a pre-verified account; if they are also invalid or unverified, report `CREDENTIALS_BLOCKER` and stop).
   - If redirected to `/dashboard`: registration succeeded; use this account for all subsequent phases.
   - If an error appears: capture #tool:playwright-browser_console_messages + screenshot, classify as `REGISTRATION_FAILED`, and fall back to `.env.local` `TEST_AUTH_EMAIL`/`TEST_AUTH_PASSWORD` credentials (if those are also unavailable, report `CREDENTIALS_BLOCKER` and stop).
8. Capture #tool:playwright-browser_take_screenshot labeled `02-registration-result.png`.

---

## Phase 3 — Authentication baseline

> Credentials priority: Phase 2 account (if registration succeeded) → `.env.local` `TEST_AUTH_EMAIL` / `TEST_AUTH_PASSWORD`.

1. Open `/` and confirm top-right controls are visible: language switcher + sign-in button.
2. If language menu is open, close/select an item first to avoid click interception.
3. Click sign-in to open auth dialog.
4. Fill email/password via #tool:playwright-browser_fill_form.
5. Submit login and wait for navigation with #tool:playwright-browser_wait_for.
6. Verify final URL is `/dashboard` and dashboard shell is truly rendered (sidebar + main content visible).
7. Capture #tool:playwright-browser_snapshot labeled `03-post-login-snapshot` as evidence.
8. If login fails, collect #tool:playwright-browser_console_messages + #tool:playwright-browser_network_requests + screenshot before attempting fixes.

---

## Phase 4 — Navigation coverage

1. Execute dashboard/sidebar route tour (all sidebar tabs).
2. Execute workspace tab route tour (all workspace tabs).
3. For every tab page, execute nested tab tour (all visible sub-tabs) using #tool:playwright-browser_click.
4. Use #tool:playwright-browser_snapshot after every route change as evidence.

### Required sidebar routes
- `/dashboard`
- `/workspaces`
- `/dashboard/account/members`
- `/dashboard/account/teams`
- `/dashboard/account/partners`
- `/dashboard/account/matrix`
- `/dashboard/account/workforce-scheduling`
- `/dashboard/account/daily`
- `/dashboard/account/audit`

### Required workspace tabs (inside one workspace)
`Capabilities` · `Members` · `Tasks` · `QA` · `Acceptance` · `Finance` · `Issues` · `Daily` · `Files` · `Schedule` · `Document Parser` · `Audit`

For each workspace tab, open all nested sub-tabs before moving on.

### Organization and workspace flow
1. On `/dashboard`, verify header contains the top-right i18n button (`Switch language`).
2. Open account switcher and change `Personal` ↔ `Organization`; verify account label updates.
3. In `Organization` context, confirm `Quick Access` workspaces are visible.
4. Enter workspace by clicking one workspace quick link (`/workspaces/{id}`).
5. Verify workspace route loaded and header still contains top-right i18n button.
6. Switch to another workspace from quick links.
7. Verify URL changes to the second workspace id and workspace page remains interactive.
8. Capture #tool:playwright-browser_take_screenshot for each milestone: switched organization, entered workspace, switched workspace.

---

## Phase 5 — Evidence and diagnosis

1. Collect #tool:playwright-browser_console_messages and #tool:playwright-browser_network_requests per failed route.
2. Use #tool:next-devtools for server-side root cause (RSC boundaries, streaming, parallel slot issues).
3. Use #tool:chrome-devtools for deeper browser-side investigation (performance, XHR, hydration anomalies).
4. Classify every issue as `FAIL`, `BLOCKED`, or `EXPECTED_GATED`.

---

## Phase 6 — Fix and verify

1. Apply minimal boundary-safe fix.
2. Re-run only affected flows with #tool:playwright-browser_navigate + #tool:playwright-browser_snapshot.
3. Regression-check auth + shell + routing after any fix.

---

## Sidebar and Nested Tab Coverage Rule (Mandatory)
1. Open every visible sidebar tab at least once.
2. On each opened tab page, open every visible nested tab/sub-tab at least once.
3. Repeat coverage when context changes (`Personal` vs `Organization`, different workspaces).
4. Save one artifact per tab level (snapshot or screenshot) with route evidence.
5. Report a coverage matrix in output: `sidebar tab -> nested tabs -> PASS/FAIL/BLOCKED`.
6. Report two top-level matrices: `Personal context` and `Organization context`.
7. For governance-only pages in personal context, use `EXPECTED_GATED` status and include gating evidence.

---

## Local test credentials
- Read credentials from project-root `.env.local`.
- Login: `TEST_AUTH_EMAIL`, `TEST_AUTH_PASSWORD`.
- Registration: `TEST_REGISTER_EMAIL`, `TEST_REGISTER_PASSWORD`, `TEST_REGISTER_DISPLAY_NAME`.
- Do not place credentials in `.github/copilot-instructions.md`.

---

## Completion gate
- The run is complete only when all mandatory flows are either:
  - `PASS` with evidence, or
  - `BLOCKED` with reproducible environment proof.
- Tab coverage is complete only when sidebar tabs and nested tabs are both fully covered.
- Any hydration mismatch console error is a hard failure and must be fixed or marked `BLOCKED` with reproducible evidence before completion.
- Phase 0 server bootstrap must be recorded in the output (was the server started or already running?).
- Phase 2 registration result must be recorded: `REGISTERED`, `VERIFY_EMAIL_REQUIRED`, or `REGISTRATION_FAILED`.

---

## Hydration mismatch verification (mandatory)
1. After each major route group (dashboard shell, workspace shell), collect #tool:playwright-browser_console_messages.
2. If logs include `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties`, classify route group as `FAIL`.
3. Run root-cause checks for SSR/CSR branch divergence, random/time-based render values, and unstable generated IDs.
4. Re-run affected routes and keep final artifact showing mismatch removed.

---

## Output
- Phase 0: server bootstrap status (`STARTED` / `ALREADY_RUNNING` / `BLOCKED`)
- Phase 2: registration status (`REGISTERED` / `VERIFY_EMAIL_REQUIRED` / `REGISTRATION_FAILED`) + credentials used
- Repro steps
- Evidence (errors/screenshots with phase labels)
- Fix summary and verification results
- Full coverage matrix for sidebar tabs, nested tabs, and global navigation links
- Coverage summary with `covered/total` and explicit `missing` counts per route group
