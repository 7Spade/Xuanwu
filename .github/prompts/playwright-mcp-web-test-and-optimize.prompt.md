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

## Output
- Repro steps
- Evidence (errors/screenshots)
- Fix summary and verification results
