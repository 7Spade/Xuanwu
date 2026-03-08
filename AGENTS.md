# AGENTS.md

Shared always-on guidance for multi-agent workflows in this repository.

## Purpose
- Provide one common rule set for all coding agents used in this workspace.
- Keep agent behavior aligned with `.github/copilot-instructions.md`.

## Source Priority
1. `.github/copilot-instructions.md`
2. `.github/instructions/*.instructions.md` (file/task-specific)
3. Task prompt requirements

## Required Behavior
- Follow architecture SSOT:
  - `docs/architecture/00-LogicOverview.md`
  - `docs/knowledge-graph.json`
  - `skills/SKILL.md`
- Enforce i18n for all UI text.
- Update both locale files when text changes:
  - `public/localized-files/en.json`
  - `public/localized-files/zh-TW.json`
- Keep locale keys identical across languages.
- Use UTF-8 (no BOM).

## Implementation Checklist
- Validate layer and slice boundaries before coding.
- Prefer existing patterns over introducing new architecture paths.
- Run at least one verification step after edits (lint/test/typecheck as applicable).
- If blocked, report exact blocker and partial state.
