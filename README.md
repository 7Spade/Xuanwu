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

This repository uses VS Code Copilot customizations with a repository guide:

- Canonical customization maintenance guide: `.github/README.md`
- Official/local customization reference set: `docs/copilot/customization/*.md`
- Global workspace instructions: `.github/copilot-instructions.md`
- Multi-agent shared conventions: `AGENTS.md`
- Live repository customizations: `.github/instructions/*.instructions.md`, `.github/agents/*.agent.md`, `.github/hooks/*.json`, `.github/prompts/*.prompt.md`, `.github/skills/*/SKILL.md`
- Reference-only codebase baseline for prompts/agents: `.github/skills/xuanwu-skill/SKILL.md`
- Loader settings for VS Code discovery: `.vscode/settings.json`
- Nested agent instructions: `src/**/AGENTS.md`

To ensure nested instructions are applied in VS Code:
- Enable `chat.useAgentsMdFile`
- Enable `chat.useNestedAgentsMdFiles` (experimental)
- Enable `chat.useCustomAgentHooks` when using agent-scoped hooks

Use `Chat: Open Chat Customizations` and Chat `Diagnostics` in VS Code to inspect loaded instructions, prompts, agents, hooks, and skills. The repository now uses compact project-specific `xuanwu-*` suites for agents, instructions, and prompts so planning, coding, UI, quality, docs, ops, and diagnostics stay consistent. For ownership, consolidation, and when-to-use guidance, prefer `.github/README.md` over this root README.

### Prompt Command Table（`/指令`）

Use the table below to invoke specialized prompts in Copilot Chat with `/command` syntax. Command names come from prompt frontmatter `name` values and must stay synchronized with `.github/prompts/`.

| Command | Prompt File |
| --- | --- |
| `/xuanwu-orchestrator` | `.github/prompts/xuanwu-orchestrator.prompt.md` |
| `/xuanwu-product` | `.github/prompts/xuanwu-product.prompt.md` |
| `/xuanwu-research` | `.github/prompts/xuanwu-research.prompt.md` |
| `/xuanwu-architect` | `.github/prompts/xuanwu-architect.prompt.md` |
| `/xuanwu-docs` | `.github/prompts/xuanwu-docs.prompt.md` |
| `/xuanwu-implementer` | `.github/prompts/xuanwu-implementer.prompt.md` |
| `/xuanwu-ui` | `.github/prompts/xuanwu-ui.prompt.md` |
| `/xuanwu-ops` | `.github/prompts/xuanwu-ops.prompt.md` |
| `/xuanwu-test-expert` | `.github/prompts/xuanwu-test-expert.prompt.md` |
| `/xuanwu-planning` | `.github/prompts/xuanwu-planning.prompt.md` |
| `/xuanwu-refactor` | `.github/prompts/xuanwu-refactor.prompt.md` |
| `/xuanwu-code-review` | `.github/prompts/xuanwu-code-review.prompt.md` |
| `/xuanwu-debug` | `.github/prompts/xuanwu-debug.prompt.md` |
| `/xuanwu-architecture-realign` | `.github/prompts/xuanwu-architecture-realign.prompt.md` |

## i18n Requirement

Do not hardcode UI text in components/pages.
When UI text changes, update both locale files with identical keys:
- `public/localized-files/en.json`
- `public/localized-files/zh-TW.json`

## Architecture Sources

- `docs/architecture/00-logic-overview.md`
- `.memory/knowledge-graph.json`
- `.github/skills/xuanwu-skill/SKILL.md`
