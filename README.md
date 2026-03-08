# Xuanwu

A modern workspace platform built with Next.js and TypeScript.

## Development

```bash
npm install
npm run dev
```

## AI Instruction System

This repository uses VS Code Copilot custom instructions:
- Global workspace instructions: `.github/copilot-instructions.md`
- Multi-agent shared conventions: `AGENTS.md`
- File-scoped rules: `.github/instructions/*.instructions.md`

## i18n Requirement

Do not hardcode UI text in components/pages.
When UI text changes, update both locale files with identical keys:
- `public/localized-files/en.json`
- `public/localized-files/zh-TW.json`

## Architecture Sources

- `docs/architecture/00-LogicOverview.md`
- `docs/knowledge-graph.json`
- `skills/SKILL.md`
