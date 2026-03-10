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
- Reference-only codebase baseline for prompts/agents: `skills/SKILL.md`
- Loader settings for VS Code discovery: `.vscode/settings.json`
- Nested agent instructions: `src/**/AGENTS.md`

To ensure nested instructions are applied in VS Code:
- Enable `chat.useAgentsMdFile`
- Enable `chat.useNestedAgentsMdFiles` (experimental)
- Enable `chat.useCustomAgentHooks` when using agent-scoped hooks

Use `Chat: Open Chat Customizations` and Chat `Diagnostics` in VS Code to inspect loaded instructions, prompts, agents, hooks, and skills. For ownership, consolidation, and when-to-use guidance, prefer `.github/README.md` over this root README.

### Prompt Command Table（`/指令`）

Use the table below to invoke specialized prompts in Copilot Chat with `/command` syntax. Command names come from prompt frontmatter `name` values and must stay synchronized with `.github/prompts/`.

| Command | Prompt File |
| --- | --- |
| `/blueprint-generator` | `.github/prompts/blueprint-generator.prompt.md` |
| `/cicd-deployment-orchestrator` | `.github/prompts/cicd-deployment-orchestrator.prompt.md` |
| `/create-vertical-slice` | `.github/prompts/create-vertical-slice.prompt.md` |
| `/documentation-writer` | `.github/prompts/documentation-writer.prompt.md` |
| `/genkit-flow-design` | `.github/prompts/genkit-flow-design.prompt.md` |
| `/legacy-decoupling-specialist` | `.github/prompts/legacy-decoupling-specialist.prompt.md` |
| `/memory-governance` | `.github/prompts/memory-governance.prompt.md` |
| `/next-diagnostics` | `.github/prompts/next-diagnostics.prompt.md` |
| `/next-intl-add-language` | `.github/prompts/next-intl-add-language.prompt.md` |
| `/nextjs-parallel-routes-modern-code` | `.github/prompts/nextjs-parallel-routes-modern-code.prompt.md` |
| `/nexus-ui-architect` | `.github/prompts/nexus-ui-architect.prompt.md` |
| `/performance-optimization-auditor` | `.github/prompts/performance-optimization-auditor.prompt.md` |
| `/route-audit-diagnostics` | `.github/prompts/route-audit-diagnostics.prompt.md` |
| `/technology-stack-blueprint-generator` | `.github/prompts/technology-stack-blueprint-generator.prompt.md` |
| `/tool-next-devtools` | `.github/prompts/next-devtools.prompt.md` |
| `/tool-repomix` | `.github/prompts/repomix.prompt.md` |
| `/tool-sequential-thinking` | `.github/prompts/sequential-thinking.prompt.md` |
| `/tool-shadcn` | `.github/prompts/shadcn.prompt.md` |
| `/tool-software-planning` | `.github/prompts/software-planning.prompt.md` |
| `/ui-ux-consistency-sync` | `.github/prompts/ui-ux-consistency-sync.prompt.md` |
| `/x-arch-adr` | `.github/prompts/x-arch-adr.prompt.md` |
| `/x-arch-audit` | `.github/prompts/x-arch-audit.prompt.md` |
| `/x-arch-docs` | `.github/prompts/x-arch-docs.prompt.md` |
| `/x-arch-gatekeeper` | `.github/prompts/x-arch-gatekeeper.prompt.md` |
| `/x-arch-graph-pruner` | `.github/prompts/x-arch-graph-pruner.prompt.md` |
| `/x-arch-remediation` | `.github/prompts/x-arch-remediation.prompt.md` |
| `/x-arch-sync` | `.github/prompts/x-arch-sync.prompt.md` |
| `/架構審查模式` | `.github/prompts/x-architecture-review-mode.prompt.md` |
| `/邏輯設計模式` | `.github/prompts/x-logic-design-mode.prompt.md` |
| `/xuanwu-test-expert` | `.github/prompts/xuanwu-test-expert.prompt.md` |
| `/x-repomix-bootstrap` | `.github/prompts/x-repomix-bootstrap.prompt.md` |

## i18n Requirement

Do not hardcode UI text in components/pages.
When UI text changes, update both locale files with identical keys:
- `public/localized-files/en.json`
- `public/localized-files/zh-TW.json`

## Architecture Sources

- `docs/architecture/00-logic-overview.md`
- `.memory/knowledge-graph.json`
- `skills/SKILL.md`
