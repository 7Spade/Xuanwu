---
description: Core project governance for all generated changes.
applyTo: "**/*"
---

# Xuanwu Core Governance

## SSOT

- Read `docs/architecture/00-logic-overview.md` before business-logic changes.
- Read `.memory/knowledge-graph.json` before entity or relation changes.
- Read `skills/SKILL.md` before broad structural refactors.

## Architecture

- Preserve slice and layer boundaries.
- Prefer structural correction over patch-style workarounds.
- Keep side effects in execution and application boundaries.

## Security

- Do not hardcode secrets.
- Use environment variables for credentials and API keys.
- Prefer safe defaults and explicit validation.

## I18n

- Do not hardcode new UI strings.
- Update both locale files with identical keys when adding UI text:
  - `public/localized-files/en.json`
  - `public/localized-files/zh-TW.json`

## Validation

- Run `get_errors` for changed files.
- When relevant, run project checks (for example `npm run check`).
