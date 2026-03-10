---
name: playwright-mcp-web-test-and-optimize
agent: 'agent'
description: 'Autonomously start the dev server, open a browser, register a new account, log in, and run full Playwright MCP browser verification combined with next-devtools diagnostics for root-cause-safe fixes.'
tools:
  - 'microsoft/playwright-mcp/*'
  - 'next-devtools/*'
  - 'vscode'
---

# Autonomous Test, Diagnose, Fix & Optimize

**Tool authority:**
- Browser automation → `microsoft/playwright-mcp` (`playwright-browser_*` tools)
- Next.js server diagnostics → `next-devtools` (`next-devtools-nextjs_index`, `next-devtools-nextjs_call`)
- Shell / process management → `vscode` terminal (use `#tool:vscode` to open a terminal and run commands)

> **Project constant:** the dev server always runs on port `9002`. All `next-devtools-nextjs_call`
> invocations use `port=9002`. If the port is changed via `package.json` or `.env`, update all
> `port=9002` references below accordingly.

**Execution rule:** run every phase fully autonomously — do not pause for confirmation unless
an unrecoverable blocker is encountered.

**Snapshot rule (mandatory for every browser action):**
Always call `#tool:playwright-browser_snapshot` immediately after each navigation or DOM change.
Always use the `ref` values returned by the **most recent** snapshot to identify elements.
Stale refs from earlier snapshots will silently target the wrong element.

## Recommended skills
- `webapp-testing`: Full browser flow validation, interaction checks, and evidence capture.
- `next-best-practices`: App Router boundary and rendering-safe fix patterns.
- `next-cache-components`: Cache Components diagnostics when route data/render behavior is unstable.

---

## Phase 0 — Autonomous dev-server bootstrap

> **Goal:** ensure `localhost:9002` is serving before any browser step.
> **Platform note:** `curl` is standard on macOS/Linux. On Windows use Git Bash, WSL, or the PowerShell snippet shown.

### 0-A  Check reachability

Use `#tool:vscode` to open a VS Code integrated terminal and run:

Unix/macOS:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:9002 2>/dev/null || echo "UNREACHABLE"
```
Windows PowerShell:
```powershell
try { (Invoke-WebRequest -Uri http://localhost:9002 -UseBasicParsing -TimeoutSec 3).StatusCode } catch { "UNREACHABLE" }
```

### 0-B  Start server if not running

If the response is not `200`/`30x`, start the dev server and capture its PID + log:
```bash
npm run dev > /tmp/dev-server.log 2>&1 &
DEV_SERVER_PID=$!
echo "DEV_SERVER_PID=$DEV_SERVER_PID"
```

### 0-C  Poll until ready (max 60 s)

```bash
for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9002 2>/dev/null || echo "000")
  [ "$code" != "000" ] && echo "READY $code" && break
  echo "Waiting... attempt $i/20"
  sleep 3
done
```

- If still `000` after 20 attempts: print last 30 lines of `/tmp/dev-server.log`, report
  `ENVIRONMENT_BLOCKER: dev server failed to start`, and **stop**.
- If response is `200`/`30x`: continue.
- If server was already running at step 0-A: log `SERVER_ALREADY_RUNNING` and continue.

### 0-D  Next.js runtime discovery via next-devtools

1. Call `#tool:next-devtools-nextjs_index` (no arguments) to discover running Next.js dev servers.
2. Confirm a server is listed on port `9002`.
3. If none found but the server was just started in step 0-B, wait 5 s and retry once.
4. Record the list of available diagnostic tool names from the response — these are valid values for
   `toolName` in `#tool:next-devtools-nextjs_call` during Phase 5.
5. If still not found: continue (next-devtools diagnostics will be skipped in Phase 5 and marked
   `TOOL_UNAVAILABLE`).

### 0-E  Cleanup after testing

After all phases complete, if the server was started by this run:
```bash
kill $DEV_SERVER_PID 2>/dev/null || true
```

---

## Phase 1 — Autonomous browser open & landing verification

**Sequence:**

1. `#tool:playwright-browser_navigate` → `http://localhost:9002`
2. `#tool:playwright-browser_snapshot` → capture a11y tree (this snapshot's `ref` values are used for steps 3–5)
3. From the snapshot, locate elements by accessible role/text:
   - Language switcher: `role=button name="Switch language"` (or equivalent visible text)
   - Sign-in button: `role=button name="Sign in"` (or equivalent)
   - If either is absent → collect `#tool:playwright-browser_console_messages` +
     `#tool:playwright-browser_network_requests` → escalate to `BLOCKED`
4. `#tool:playwright-browser_take_screenshot` → save as `01-landing.png`

---

## Phase 2 — Autonomous registration (sign-up) flow

> **Goal:** create a fresh test account so subsequent phases are not dependent on a pre-existing account state.

### Credentials resolution

Read from `.env.local`:
| Variable | Behaviour if absent |
|---|---|
| `TEST_REGISTER_EMAIL` | auto-generate `test+<unix-timestamp>@xuanwu.test` |
| `TEST_REGISTER_PASSWORD` | auto-generate `TestPass!<unix-timestamp>` |
| `TEST_REGISTER_DISPLAY_NAME` | default `Test User` |

### Sign-up sequence

1. `#tool:playwright-browser_snapshot` → identify the **Sign Up / Register** control.
   Search snapshot for `role=button` or `role=link` with text matching `Sign Up`, `Register`,
   or `Create account` (case-insensitive). Record exact `ref`.
2. `#tool:playwright-browser_click` using that `ref`.
3. `#tool:playwright-browser_snapshot` → refresh refs after DOM change.
4. `#tool:playwright-browser_wait_for` → wait for sign-up form/dialog to appear.
5. `#tool:playwright-browser_snapshot` → capture form field refs.
6. `#tool:playwright-browser_fill_form` using current snapshot refs:
   - Email field → resolved `TEST_REGISTER_EMAIL`
   - Password field → resolved `TEST_REGISTER_PASSWORD`
   - Display name field → resolved `TEST_REGISTER_DISPLAY_NAME` (skip if not in snapshot)
7. Locate submit button via snapshot: `role=button` with text `Register`/`Sign Up`/`Create account`.
8. `#tool:playwright-browser_click` on submit button ref.
   - If no clickable button ref is found in the snapshot, use `#tool:playwright-browser_press_key` → `Enter` as a submit alternative.
9. `#tool:playwright-browser_wait_for` → wait for redirect or error message.
10. `#tool:playwright-browser_snapshot` → assess outcome:
    - URL is `/dashboard` → `REGISTERED`; use this account for all remaining phases.
    - URL contains `verify` or `confirm` → `VERIFY_EMAIL_REQUIRED`; fall back to
      `TEST_AUTH_EMAIL`/`TEST_AUTH_PASSWORD` from `.env.local` (must be pre-verified;
      if also invalid → `CREDENTIALS_BLOCKER` and stop).
    - Error message visible in snapshot → `REGISTRATION_FAILED`;
      collect `#tool:playwright-browser_console_messages` + screenshot;
      fall back to `TEST_AUTH_EMAIL`/`TEST_AUTH_PASSWORD` (if unavailable → `CREDENTIALS_BLOCKER` and stop).
11. `#tool:playwright-browser_take_screenshot` → save as `02-registration-result.png`.

---

## Phase 3 — Authentication baseline

> **Credentials priority:** Phase 2 account (if `REGISTERED`) → `.env.local` `TEST_AUTH_EMAIL` / `TEST_AUTH_PASSWORD`.

**Sequence:**

1. `#tool:playwright-browser_navigate` → `/`
2. `#tool:playwright-browser_snapshot` → verify language switcher + sign-in button visible.
   - If language menu is already open: `#tool:playwright-browser_press_key` → `Escape` to close it,
     then `#tool:playwright-browser_snapshot` to refresh refs.
3. `#tool:playwright-browser_click` → sign-in button ref from snapshot.
4. `#tool:playwright-browser_snapshot` → refresh refs inside auth dialog.
5. `#tool:playwright-browser_fill_form` → fill email + password fields using current snapshot refs.
6. `#tool:playwright-browser_click` → submit button ref (`role=button name="Sign in"` or equivalent).
   - If no clickable button ref is found in the snapshot, use `#tool:playwright-browser_press_key` → `Enter` as a submit alternative.
7. `#tool:playwright-browser_wait_for` → wait for URL to contain `/dashboard`.
8. `#tool:playwright-browser_snapshot` → verify dashboard shell rendered (sidebar + main content present).
   Save as `03-post-login-snapshot`.
9. On login failure:
   - `#tool:playwright-browser_console_messages` + `#tool:playwright-browser_network_requests` +
     `#tool:playwright-browser_take_screenshot` → save as `03-login-fail.png` → classify `FAIL`.

---

## Phase 4 — Navigation coverage

**Per-route sequence (repeat for every route):**
1. `#tool:playwright-browser_navigate` → target URL (or `#tool:playwright-browser_click` on nav link ref)
2. `#tool:playwright-browser_snapshot` → mandatory after every route change; record new refs
3. `#tool:playwright-browser_take_screenshot` → save as `04-<route-name>.png`
4. `#tool:playwright-browser_console_messages` → check for errors; classify route as `PASS`/`FAIL`/`BLOCKED`

**Tab management for workspace traversal:**
- Open a new tab when needed: `#tool:playwright-browser_tab_new`
- Switch between open tabs: `#tool:playwright-browser_tab_select`
- List open tabs: `#tool:playwright-browser_tab_list`
- Close a tab when done: `#tool:playwright-browser_tab_close`

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

For each workspace tab → open all nested sub-tabs before moving on.

### Organization and workspace flow
1. `#tool:playwright-browser_snapshot` → verify `Switch language` button exists in header.
2. Open account switcher via `#tool:playwright-browser_click` on its ref → switch `Personal` ↔ `Organization`.
3. `#tool:playwright-browser_snapshot` → confirm account label updated.
4. `#tool:playwright-browser_click` → Quick Access workspace link in Organization context.
5. `#tool:playwright-browser_snapshot` → confirm workspace route + i18n button.
6. `#tool:playwright-browser_click` → second workspace quick link.
7. `#tool:playwright-browser_snapshot` → confirm new workspace id in URL.
8. `#tool:playwright-browser_take_screenshot` for each milestone (organization switch, workspace entry, workspace switch).

---

## Phase 5 — Evidence and diagnosis

### 5-A  Browser-side evidence (per failed route)
1. `#tool:playwright-browser_console_messages` → collect all log entries.
2. `#tool:playwright-browser_network_requests` → identify 4xx/5xx requests and missing assets.
3. `#tool:playwright-browser_take_screenshot` → save as `05-fail-<route-name>.png`.

### 5-B  Server-side diagnosis via next-devtools (requires discovery in Phase 0-D)

For each route classified as `FAIL`:

1. **Get compilation/runtime errors:**
   `#tool:next-devtools-nextjs_call` with `port=9002`, `toolName="get_errors"`.
   - Review error list; match errors to the failing route.

2. **Verify route map:**
   `#tool:next-devtools-nextjs_call` with `port=9002`, `toolName="get_routes"`.
   - Confirm the route is registered; missing routes indicate a file naming or slot wiring issue.

3. **Check build status:**
   `#tool:next-devtools-nextjs_call` with `port=9002`, `toolName="get_build_status"`.
   - Compilation errors block rendering; fix them before diagnosing runtime behavior.

4. **RSC/Client boundary or streaming issues (if applicable):**
   Use any additional diagnostic tools discovered in Phase 0-D. If a tool name is uncertain,
   call `#tool:next-devtools-nextjs_index` again to refresh the available tool list.

5. If next-devtools is unavailable (Phase 0-D returned nothing), mark server-side checks as
   `TOOL_UNAVAILABLE` and rely solely on browser-side evidence.

### 5-C  Issue classification
| Status | Criteria |
|---|---|
| `FAIL` | Error confirmed, root cause identified |
| `BLOCKED` | Reproducible env issue; cannot proceed |
| `EXPECTED_GATED` | Governance-only page in Personal context |

---

## Phase 6 — Fix and verify

1. Apply the minimal boundary-safe fix identified in Phase 5.
2. Validate the fix without full page reload first; if Fast Refresh triggers, check console output.
3. `#tool:playwright-browser_navigate` → re-navigate to the affected route.
4. `#tool:playwright-browser_snapshot` → confirm fix applied.
5. `#tool:playwright-browser_console_messages` → confirm error no longer appears.
6. `#tool:next-devtools-nextjs_call` with `port=9002`, `toolName="get_errors"` → confirm 0 errors.
7. Regression check: repeat Phase 3 (auth) + Phase 1 landing → confirm no regressions.
8. `#tool:playwright-browser_take_screenshot` → save as `06-fix-verified-<route>.png`.

---

## Sidebar and Nested Tab Coverage Rule (Mandatory)
1. Open every visible sidebar tab at least once.
2. On each opened tab page, open every visible nested tab/sub-tab at least once.
3. Repeat coverage when context changes (`Personal` vs `Organization`, different workspaces).
4. Save one artifact per tab level (snapshot or screenshot) with route evidence.
5. Report a coverage matrix: `sidebar tab → nested tabs → PASS/FAIL/BLOCKED`.
6. Report two top-level matrices: `Personal context` and `Organization context`.
7. For governance-only pages in personal context, use `EXPECTED_GATED` + gating evidence.

---

## Local test credentials
- Read credentials from project-root `.env.local`.
- Login: `TEST_AUTH_EMAIL`, `TEST_AUTH_PASSWORD`.
- Registration: `TEST_REGISTER_EMAIL`, `TEST_REGISTER_PASSWORD`, `TEST_REGISTER_DISPLAY_NAME`.
- Do not place credential values in `.github/copilot-instructions.md`.

---

## Completion gate
- All mandatory flows must be `PASS` (with evidence) or `BLOCKED` (with reproducible proof).
- Tab coverage complete only when sidebar tabs + all nested sub-tabs fully covered.
- Any hydration mismatch is a hard `FAIL` — must be fixed or explicitly `BLOCKED` with evidence.
- Phase 0 bootstrap status must appear in output.
- Phase 2 registration outcome must appear in output.
- Phase 5-B next-devtools results (or `TOOL_UNAVAILABLE`) must appear in output.

---

## Hydration mismatch verification (mandatory)
1. After each major route group, call `#tool:playwright-browser_console_messages`.
2. If logs contain `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties`,
   classify the route group as `FAIL`.
3. Root-cause candidates (check in order):
   - Non-deterministic IDs generated differently on server vs client
   - SSR/CSR conditional branches (`typeof window`)
   - `Date.now()` / `Math.random()` in render
   - Locale-dependent number/date formatting during SSR
4. Re-run affected routes; keep final artifact showing mismatch removed.

---

## Output
| Section | Required content |
|---|---|
| Phase 0 | Bootstrap status: `STARTED` / `ALREADY_RUNNING` / `BLOCKED`; next-devtools discovery result |
| Phase 2 | Registration outcome: `REGISTERED` / `VERIFY_EMAIL_REQUIRED` / `REGISTRATION_FAILED` / `CREDENTIALS_BLOCKER`; credentials used (no values) |
| Evidence | Labeled screenshots + snapshot refs per phase |
| Diagnosis | Per-route: browser console errors, network failures, next-devtools error/route/build output |
| Fix summary | File changed, change description, re-test result |
| Coverage matrix | `sidebar tab → nested tabs → status` for Personal + Organization contexts |
| Coverage summary | `covered/total` + explicit `missing` list per route group |
