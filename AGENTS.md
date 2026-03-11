# AGENTS.md

Shared always-on guidance for multi-agent workflows in this repository.

## Purpose
- Provide one common rule set for all coding agents used in this workspace.
- Keep agent behavior aligned with `.github/copilot-instructions.md`.

## Source Priority
1. `.github/copilot-instructions.md`
2. `.github/instructions/*.instructions.md` (file/task-specific)
3. Task prompt requirements

## VS Code Settings
- Enable `chat.useAgentsMdFile` to load `AGENTS.md` instructions.
- Enable `chat.useNestedAgentsMdFiles` to apply nested `AGENTS.md` in subfolders (experimental).

## Required Behavior
- Follow architecture SSOT:
  - `docs/architecture/00-logic-overview.md`
  - `.memory/knowledge-graph.json`
  - `.github/skills/xuanwu-skill/SKILL.md`
- Enforce i18n for all UI text.
- Update both locale files when text changes:
  - `public/localized-files/en.json`
  - `public/localized-files/zh-TW.json`
- Keep locale keys identical across languages.
- Use UTF-8 (no BOM).

## Knowledge Persistence
- **Read first**: At the start of any session, use `memory-search_nodes` to load relevant prior context from `.memory/knowledge-graph.json` before reasoning or producing output.
- **Write after discoveries**: After completing research or uncovering important codebase facts, persist them using `memory-create_entities`, `memory-add_observations`, or `memory-create_relations`.
- **Use store_memory**: When VS Code Copilot Chat memory is available, call `store_memory` to record lasting project conventions and patterns across conversations.
- **Keep current**: Remove stale nodes with `memory-delete_entities` when facts become obsolete.

## Implementation Checklist
- Validate layer and slice boundaries before coding.
- Prefer existing patterns over introducing new architecture paths.
- Run at least one verification step after edits (lint/test/typecheck as applicable).
- If blocked, report exact blocker and partial state.
