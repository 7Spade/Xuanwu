---
name: xuanwu-web-bootstrap
description: Skill to bootstrap React/Next.js + Firebase + testing tasks and verify Serena-first workflow.
argument-hint: "Target feature or test scenario to bootstrap"
---

# Xuanwu Web Bootstrap Skill

Use this skill to prepare or repair webapp-related workflows and to ensure tooling and validation are in place.

Workflow:

1. Read `skills/SKILL.md` for repo orientation and `project-structure.md` if available.
2. Verify `.vscode/mcp.json` contains `io.github.upstash/context7`, `sequentialthinking`, `software-planning`, and `oraios/serena`.
3. Resolve `/oraios/serena` via Context7 and fetch MCP setup and onboarding guidance.
4. Run `sequentialthinking` to create a compact, risk-aware plan; use `software-planning` for multi-step tasks.
5. Execute Serena init chain (`initial_instructions`, `check_onboarding_performed`) before edits.
6. Implement focused changes:
   - React/Next.js: follow App Router conventions and keep parallel routes isolated in feature domains.
   - Firebase: provide config templates and document where env vars must be set; do not commit credentials.
   - Testing: add Playwright E2E skeletons and unit test hooks; add CI check commands to `package.json` if missing.
7. Validate: run `npm run check`; run tests; verify i18n keys were added to both locale files.

Validation checklist:

- MCP keys present and callable.
- Serena initialization and onboarding status checked.
- Changes include tests or test hooks.
- No secrets committed; `.env.example` present when applicable.
- i18n keys updated in `public/localized-files/en.json` and `public/localized-files/zh-TW.json`.
