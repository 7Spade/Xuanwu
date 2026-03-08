# Copilot Instructions for Xuanwu

Project-wide always-on instructions for GitHub Copilot Chat.

## Scope
- Apply these rules to all tasks in this repository.
- Use file-based instructions in `.github/instructions/*.instructions.md` for language or feature-specific rules.

## Single Sources of Truth
- Business logic: `docs/architecture/00-LogicOverview.md`
- Entity semantics: `docs/knowledge-graph.json`
- Codebase map: `skills/SKILL.md`

> All project facts (Single Source of Truth) must come from:
>
> - `docs/knowledge-graph.json`
> - `docs/architecture/00-LogicOverview.md`
> - `docs/ai/repomix-output.context.md`
>
> Any inference, process definition, task decomposition, or AI judgment must be grounded in these three documents. Do not make unsupported assumptions.

## Mandatory Rules (Highest Priority)
- Use UTF-8 (no BOM) for all created/updated text files.
- Do not hardcode UI strings in pages/components.
- All UI text must use i18n keys.
- When adding or changing UI text, update both locale files with identical keys:
  - `public/localized-files/en.json`
  - `public/localized-files/zh-TW.json`
- Missing either locale key means the task is incomplete.

## Decision Workflow
1. Read `docs/architecture/00-LogicOverview.md` for business logic decisions.
2. Confirm entities and relations in `docs/knowledge-graph.json`.
3. Reuse existing code patterns from `skills/SKILL.md` and referenced files.
4. If logic is undefined, update knowledge first, then implement.

## Architecture Guardrails
- Respect layer direction and slice boundaries.
- Do not bypass public APIs across bounded contexts.
- Keep side effects in execution/application layers.
- Preserve authority boundaries (Search, Notification, Semantic, Firebase).

## Task Routing
- Bootstrap/tooling setup tasks: `.github/prompts/x-repomix-bootstrap.prompt.md`
- Refactor/migration/boundary remediation: `.github/prompts/x-arch-remediation.prompt.md`
- Compliance/pre-commit architecture checks: `.github/prompts/x-arch-gatekeeper.prompt.md` or `compliance-audit.prompt.md`

## Large Move Protocol
1. Submit a move-map (`source -> destination`) before moving files.
2. Move at most 5 files per batch, then run error checks.
3. Do not create barrel-only pseudo layering before real file moves.
4. Add compatibility shims only after new paths compile.
5. If a tool fails, report partial state and stop.

## Companion Instruction Files
- Multi-agent workspace conventions: `AGENTS.md`
- Project setup and contributor context: `README.md`