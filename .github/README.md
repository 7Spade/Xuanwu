# Copilot Customization Development Guide

This guide defines how Xuanwu organizes and evolves repository-scoped GitHub Copilot customizations.

## Authoritative References

Use the local `docs/copilot/` copies as the repository reference set, and keep them aligned with the corresponding VS Code documentation:

- Custom instructions: `docs/copilot/customization/custom-instructions.md`
- Prompt files: `docs/copilot/customization/prompt-files.md`
- Custom agents: `docs/copilot/customization/custom-agents.md`
- Agent Skills: `docs/copilot/customization/agent-skills.md`
- Hooks: `docs/copilot/customization/hooks.md`
- Agent plugins: `docs/copilot/customization/agent-plugins.md`
- Overview and editor workflow: `docs/copilot/customization/overview.md`

## Single Sources of Truth

Copilot customizations in this repository must stay aligned with:

- Business logic: `docs/architecture/00-logic-overview.md`
- Entity semantics: `.memory/knowledge-graph.json`
- Codebase reference baseline: `skills/SKILL.md`

## Design Principles

1. **One customization type, one responsibility**
   - `.github/copilot-instructions.md` is for concise, always-on rules.
   - `.github/instructions/` is for scoped rules selected by file pattern or task.
   - `.github/prompts/` is for reusable slash-command workflows.
   - `.github/agents/` is for custom personas, tool boundaries, and optional agent-scoped hooks.
   - `.github/skills/` is for portable, on-demand capabilities.
   - `.github/hooks/` is for deterministic workspace hook automation.

2. **Prefer links over duplication**
   - Reuse repository docs with Markdown links.
   - Do not restate the same standards in every prompt, skill, or agent.

3. **Keep always-on context lean**
   - Put stable global rules in `.github/copilot-instructions.md`.
   - Move catalogs, workflows, and long procedures into this guide, prompts, skills, or scoped instructions.

4. **Use official terminology**
   - “Agent plugins” means VS Code plugin bundles configured through `chat.plugins.*`.
   - Do not use `plugins/` as a local subfolder name for ordinary repository agents.

5. **Only link to real files**
   - Prompt, skill, and agent references must resolve to files that exist in the repository.

## Canonical Repository Layout

| Path | Purpose | Allowed contents | Notes |
| --- | --- | --- | --- |
| `.github/copilot-instructions.md` | Project-wide always-on instructions | Markdown only | Keep concise and stable |
| `.github/agents/` | Repository-scoped custom agents | `*.agent.md` | All local agents live directly in this folder |
| `.github/hooks/` | Workspace hook configs | `*.json`, `scripts/` | Hook scripts must be deterministic and non-interactive |
| `.github/instructions/` | File/task-scoped instructions | `*.instructions.md` | Every file needs frontmatter with narrow `applyTo` |
| `.github/prompts/` | Reusable slash commands | `*.prompt.md` | Prompt command name comes from frontmatter `name` when present |
| `.github/skills/` | Project Agent Skills | `<skill>/SKILL.md` and optional resources | Canonical project skill location |

## Folder-Specific Rules

### `.github/copilot-instructions.md`

- Keep only global conventions, safety requirements, SSOT references, and universal workflow rules.
- Do not use it as a full catalog of prompts, skills, or agents.
- When a rule is file-specific, move it to `.github/instructions/`.

### `.github/agents/`

- Follow `docs/copilot/customization/custom-agents.md`.
- Use least-privilege `tools`.
- Use agent-scoped `hooks` only when behavior must run exclusively with that agent.
- Keep repository agents in `.github/agents/`; do not create `.github/agents/plugins/`.
- If a bundled plugin is needed, manage it through VS Code plugin settings rather than this folder. For the plugin model, see `docs/copilot/customization/agent-plugins.md` and treat marketplace or `chat.plugins.paths` bundles as plugins; treat `.github/agents/*.agent.md` files as repository agents.

### `.github/hooks/`

- Follow `docs/copilot/customization/hooks.md`.
- Store workspace hook config in `.github/hooks/*.json`.
- Keep helper scripts in `.github/hooks/scripts/` or `scripts/hooks/`.
- Hook commands must be deterministic, reviewable, and safe to run repeatedly.

### `.github/instructions/`

- Follow `docs/copilot/customization/custom-instructions.md`.
- Every file must include YAML frontmatter with `name`, `description`, and `applyTo`.
- Scope `applyTo` as narrowly as possible.
- Keep instructions imperative, testable, and free of duplicated catalog content.

### `.github/prompts/`

- Follow `docs/copilot/customization/prompt-files.md`.
- Every prompt should have a discoverable `name` and `description`.
- Prefer linking to docs instead of embedding long policy text.
- `README.md` must stay synchronized with the actual prompt file set and frontmatter names.

### `.github/skills/`

- Follow `docs/copilot/customization/agent-skills.md`.
- Each skill must live in its own folder with a `SKILL.md`.
- Skill descriptions must clearly say what the skill does and when to use it.
- Repository skill discovery should point to `.github/skills/`; `skills/SKILL.md` remains a reference document, not an active project skill entry point.

## Current Consolidation Decisions

The repository now follows these consolidation rules:

1. All local custom agents live directly under `.github/agents/`.
2. The former `.github/agents/plugins/` pattern is retired because it conflicts with VS Code “agent plugins”.
3. `.github/skills/` is the canonical project skill location for VS Code settings.
4. Stable repository references used by prompts must exist under `docs/` or other committed paths.
5. `README.md` remains the user-facing entry point and must keep its prompt command table synchronized with `.github/prompts/`.

## Required Reference Documents for Customizations

These documents are stable link targets for prompts and agents that need repository context:

- `docs/domain-glossary.md`
- `docs/project-structure.md`
- `docs/persistence-model-overview.md`
- `docs/architecture/00-logic-overview.md`
- `.memory/knowledge-graph.json`
- `skills/SKILL.md`

## Change Workflow

When adding or reorganizing Copilot customization files:

1. Update this guide first if folder policy or ownership changes.
2. Apply the smallest structural change that restores compliance.
3. Sync `README.md` and any dependent references.
4. Run repository validation commands when available:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test`
   - `npm run check`
5. Use VS Code diagnostics to inspect loaded instructions, prompts, agents, hooks, and skills:
   - `Chat: Open Chat Customizations`
   - Chat view → right-click → `Diagnostics`

## Review Checklist

- Are folder purposes still distinct and non-overlapping?
- Does every linked file actually exist?
- Is `.github/copilot-instructions.md` still concise?
- Does `README.md` reflect actual slash commands and customization locations?
- Are hooks and agents using official VS Code terminology correctly?
