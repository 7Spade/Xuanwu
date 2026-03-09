---
name: playwright-mcp-web-test-and-optimize
agent: 'agent'
tools: ['playwright-browser_*', 'next-devtools', 'edit/editFiles']
description: 'Run browser verification with Playwright MCP and combine with next-devtools diagnostics for root-cause-safe fixes.'
---

# Integrated Test, Diagnose, Fix & Optimize

Use Playwright for browser truth and next-devtools for Next.js runtime truth.

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

## Output
- Repro steps
- Evidence (errors/screenshots)
- Fix summary and verification results
