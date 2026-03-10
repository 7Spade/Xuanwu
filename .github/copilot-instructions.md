# Copilot Instructions for Xuanwu

Project-wide always-on instructions for GitHub Copilot Chat in this repository.

## Scope

- Apply these rules to all tasks in this repository.
- Use `.github/instructions/*.instructions.md` for language-, framework-, or file-scoped rules.
- Use `.github/README.md` as the repository guide for Copilot customization structure and maintenance.

## Single Sources of Truth

- Business logic: `docs/architecture/00-logic-overview.md`
- Entity semantics and relationships: `.memory/knowledge-graph.json`
- Codebase reference baseline: `skills/SKILL.md`

If a task touches business rules or domain terminology, read the SSOT documents before changing code or documentation.

## Always-On Development Rules

### Architecture and boundaries

- Respect layer direction, slice boundaries, and public APIs.
- Keep side effects in execution or application layers, not pure contract layers.
- Do not invent domain logic that is not grounded in the SSOT documents.

### Instructions and customization hygiene

- Keep always-on instructions concise; move specialized workflows into prompts, skills, agents, hooks, or scoped instructions according to `.github/README.md`.
- Reuse existing repository documents with links instead of duplicating long policy text.
- Use the official VS Code customization taxonomy from `docs/copilot/customization/overview.md` before introducing or renaming customization assets.
- Do not use local folder names or terminology that conflict with official VS Code Copilot concepts.

### i18n

- Do not hardcode UI text in pages or components.
- When UI text changes, update both locale files with identical keys:
  - `public/localized-files/en.json`
  - `public/localized-files/zh-TW.json`

### Files and encoding

- Use UTF-8 without BOM for created or edited text files.
- Keep code identifiers in English by default unless a Taiwan-domain term requires Traditional Chinese for precision.

### Quality and security

- Prefer deterministic, reviewable changes over ad-hoc workarounds.
- Keep documentation synchronized when behavior, setup, or customization layout changes.
- Do not hardcode secrets or bypass existing security boundaries.

## Decision Workflow

1. Read `docs/architecture/00-logic-overview.md` when business logic is involved.
2. Confirm relevant entities in `.memory/knowledge-graph.json`.
3. Reuse established repository patterns from `skills/SKILL.md` and existing code.
4. For Copilot customization changes, follow `.github/README.md` first, then the matching spec under `docs/copilot/customization/`, before editing `.github/agents`, `.github/hooks`, `.github/instructions`, `.github/prompts`, or `.github/skills`.

## Companion Files

- Repository Copilot customization guide: `.github/README.md`
- Shared multi-agent conventions: `AGENTS.md`
- File-scoped rules: `.github/instructions/*.instructions.md`
