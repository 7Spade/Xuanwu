# Xuanwu

A modern workspace platform built with Next.js and TypeScript.

## Development

```bash
npm install
npm run dev
```

### Environment Variables (Firebase App Check)

- `NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY`: reCAPTCHA v3 site key used by Firebase App Check on web.
- `NEXT_PUBLIC_FIREBASE_APP_CHECK_ENABLED`: optional toggle (`true` by default, set `false` for local troubleshooting).

If no site key is provided, App Check is skipped by design and the app continues with best-effort behavior.

## AI Instruction System

This repository uses VS Code Copilot custom instructions:
- Global workspace instructions: `.github/copilot-instructions.md`
- Multi-agent shared conventions: `AGENTS.md`
- File-scoped rules: `.github/instructions/*.instructions.md`
- Nested agent instructions: `src/**/AGENTS.md`

To ensure nested instructions are applied in VS Code:
- Enable `chat.useAgentsMdFile`
- Enable `chat.useNestedAgentsMdFiles` (experimental)

## i18n Requirement

Do not hardcode UI text in components/pages.
When UI text changes, update both locale files with identical keys:
- `public/localized-files/en.json`
- `public/localized-files/zh-TW.json`

## Architecture Sources

- `docs/architecture/00-logic-overview.md`
- `docs/knowledge-graph.json`
- `skills/SKILL.md`
