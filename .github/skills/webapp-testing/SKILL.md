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

## Login Test Procedure (Mandatory)
1. Start from landing page `/`.
2. Verify top-right language switcher and sign-in button both exist.
3. Close/select language menu before clicking sign-in to prevent overlay click blocking.
4. Open sign-in dialog, input `TEST_AUTH_EMAIL` and `TEST_AUTH_PASSWORD`.
5. Submit and wait for route transition.
6. Assert final page is `/dashboard` with visible dashboard shell nodes (navigation + content area).
7. Record result with one post-login snapshot and key console/network anomalies if any.

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
