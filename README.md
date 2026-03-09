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

### Prompt Command Table（`/指令`）

Use the table below to invoke specialized prompts in Copilot Chat with `/command` syntax. Each command activates a specific architectural, testing, or development workflow.

| Command | Prompt File |
| --- | --- |
| `/ai-architecture-governance` | `.github/prompts/ai-architecture-governance.prompt.md` |
| `/architectural-audit-and-design-specialist` | `.github/prompts/architectural-audit-and-design-specialist.prompt.md` |
| `/boundary-check` | `.github/prompts/boundary-check.prompt.md` |
| `/cicd-deployment-orchestrator` | `.github/prompts/cicd-deployment-orchestrator.prompt.md` |
| `/code-exemplars-blueprint-generator` | `.github/prompts/code-exemplars-blueprint-generator.prompt.md` |
| `/compliance-audit` | `.github/prompts/compliance-audit.prompt.md` |
| `/create-vertical-slice` | `.github/prompts/create-vertical-slice.prompt.md` |
| `/ddd-boundary-check` | `.github/prompts/ddd-boundary-check.prompt.md` |
| `/documentation-writer` | `.github/prompts/documentation-writer.prompt.md` |
| `/genkit-flow-design` | `.github/prompts/genkit-flow-design.prompt.md` |
| `/iterative-alignment-refactor` | `.github/prompts/iterative-alignment-refactor.prompt.md` |
| `/legacy-decoupling-specialist` | `.github/prompts/legacy-decoupling-specialist.prompt.md` |
| `/memory-governance` | `.github/prompts/memory-governance.prompt.md` |
| `/next-devtools` | `.github/prompts/next-devtools.prompt.md` |
| `/next-intl-add-language` | `.github/prompts/next-intl-add-language.prompt.md` |
| `/nextjs-parallel-routes-modern-code` | `.github/prompts/nextjs-parallel-routes-modern-code.prompt.md` |
| `/performance-optimization-auditor` | `.github/prompts/performance-optimization-auditor.prompt.md` |
| `/playwright-mcp-web-test-and-optimize` | `.github/prompts/playwright-mcp-web-test-and-optimize.prompt.md` |
| `/repomix` | `.github/prompts/repomix.prompt.md` |
| `/route-audit-diagnostics` | `.github/prompts/route-audit-diagnostics.prompt.md` |
| `/sequential-thinking` | `.github/prompts/sequential-thinking.prompt.md` |
| `/shadcn` | `.github/prompts/shadcn.prompt.md` |
| `/software-planning` | `.github/prompts/software-planning.prompt.md` |
| `/technology-stack-blueprint-generator` | `.github/prompts/technology-stack-blueprint-generator.prompt.md` |
| `/ui-ux-consistency-sync` | `.github/prompts/ui-ux-consistency-sync.prompt.md` |
| `/x-arch-adr` | `.github/prompts/x-arch-adr.prompt.md` |
| `/x-arch-auditor` | `.github/prompts/x-arch-auditor.prompt.md` |
| `/x-arch-gatekeeper` | `.github/prompts/x-arch-gatekeeper.prompt.md` |
| `/x-arch-graph-pruner` | `.github/prompts/x-arch-graph-pruner.prompt.md` |
| `/x-arch-remediation` | `.github/prompts/x-arch-remediation.prompt.md` |
| `/x-arch-sync` | `.github/prompts/x-arch-sync.prompt.md` |
| `/x-architecture-review-mode` | `.github/prompts/x-architecture-review-mode.prompt.md` |
| `/x-logic-design-mode` | `.github/prompts/x-logic-design-mode.prompt.md` |
| `/x-repomix-bootstrap` | `.github/prompts/x-repomix-bootstrap.prompt.md` |

## i18n Requirement

Do not hardcode UI text in components/pages.
When UI text changes, update both locale files with identical keys:
- `public/localized-files/en.json`
- `public/localized-files/zh-TW.json`

## Architecture Sources

- `docs/architecture/00-logic-overview.md`
- `docs/knowledge-graph.json`
- `skills/SKILL.md`
