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

- Business logic: `docs/architecture/README.md`
- Entity semantics: `.memory/knowledge-graph.json`
- Codebase reference baseline: `.github/skills/xuanwu-skill/SKILL.md`

## Customization Selection Matrix

Use the official VS Code customization taxonomy first, then map it to the repository layout below.

| Need | Primary customization type | Activation model | Repository home | Do not use when |
| --- | --- | --- | --- | --- |
| Stable rules that apply to every task | Always-on instructions | Automatic in every chat | `.github/copilot-instructions.md`, `AGENTS.md` | The guidance is file-specific or workflow-specific |
| Narrow rules for file types, frameworks, or authoring tasks | File-based instructions | Automatic when `applyTo` or task semantics match | `.github/instructions/*.instructions.md` | The content is a reusable slash workflow or agent persona |
| Repeatable task invoked with `/command` | Prompt files | Manual slash-command invocation | `.github/prompts/*.prompt.md` | The behavior needs persistent tool boundaries or subagent orchestration |
| Specialized persona with constrained tools or handoffs | Custom agents | Selected explicitly or invoked as subagents | `.github/agents/*.agent.md` | The content is just a rule set or one-off prompt body |
| Portable, on-demand capability with resources/scripts | Agent Skills | Loaded when relevant or invoked via `/` | `.github/skills/<skill>/SKILL.md` | The content only defines project policy or folder ownership |
| Deterministic automation at lifecycle boundaries | Hooks | Triggered by lifecycle event | `.github/hooks/*.json` and agent `hooks:` frontmatter | The behavior can be expressed as normal instructions or prompts |
| Marketplace-delivered customization bundles | Agent plugins | Installed through VS Code plugin settings | `chat.plugins.*` settings, not repository folders | The customization is local to this repository |

## Repository Design Workflow

Design or refactor Copilot customization assets in this order:

1. Start from `docs/copilot/customization/overview.md` to choose the correct customization type.
2. Use the corresponding official/local spec before editing files:
   - instructions → `docs/copilot/customization/custom-instructions.md`
   - prompts → `docs/copilot/customization/prompt-files.md`
   - agents → `docs/copilot/customization/custom-agents.md`
   - skills → `docs/copilot/customization/agent-skills.md`
   - hooks → `docs/copilot/customization/hooks.md`
   - plugins → `docs/copilot/customization/agent-plugins.md`
3. Update this guide first when folder ownership, terminology, or consolidation rules change.
4. Keep `.github/copilot-instructions.md` lean and move scoped or workflow-specific content into the correct customization type.
5. Keep loader settings aligned in `.vscode/settings.json` so discovery matches the documented repository layout.
6. Sync user-facing entry points (`README.md`, prompt references, and stable links) after structural changes.

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

## Consolidation Rules

- `.github/README.md` is the canonical repository maintenance guide for Copilot customization structure, ownership, and consolidation decisions.
- `.github/copilot-instructions.md` is only for concise always-on rules; it must not become a duplicate catalog of agents, prompts, or hooks.
- `README.md` is the user-facing quick entry point; keep only the high-level navigation and prompt command catalog there.
- `docs/copilot/customization/*.md` remains the local reference mirror of the official VS Code customization docs and should be cited rather than paraphrased repeatedly.
- `.vscode/settings.json` is the effective loader configuration; documentation must describe the configuration that is actually enabled there.
- `.github/skills/xuanwu-skill/SKILL.md` is the active VS Code project skill and repository codebase reference baseline; `skills/SKILL.md` is a redirect pointer to this location.
- Keep the customization folders intentionally small and consistent: prefer project-specific `xuanwu-<function>.*.md` files that absorb overlapping personas, rules, and workflows into functional suites.

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
- Repository skill discovery points to `.github/skills/`; `xuanwu-skill` is the active project skill entry point at `.github/skills/xuanwu-skill/SKILL.md`.

## Current Consolidation Decisions

The repository now follows these consolidation rules:

1. All local custom agents live directly under `.github/agents/`.
2. The former `.github/agents/plugins/` pattern is retired because it conflicts with VS Code “agent plugins”.
3. `.github/skills/` is the canonical project skill location for VS Code settings.
4. Stable repository references used by prompts must exist under `docs/` or other committed paths.
5. `README.md` remains the user-facing entry point and must keep its prompt command table synchronized with `.github/prompts/`.
6. The canonical project-specific agent suite is `xuanwu-orchestrator`, `xuanwu-product`, `xuanwu-research`, `xuanwu-architect`, `xuanwu-implementer`, `xuanwu-ui`, `xuanwu-quality`, `xuanwu-docs`, `xuanwu-ops`, and `xuanwu-test-expert`. Supplementary agents extending the suite: `xuanwu-commander` (intent clarification and single dispatch), `xuanwu-software-planner` (implementation planning), `xuanwu-sequential-thinking` (step-by-step reasoning), `xuanwu-architecture-chief` (architecture doc refinement), `xuanwu-architecture-refactor` (doc structure refactoring), `xuanwu-diagram-designer` (Mermaid diagram refinement), and `xuanwu-repo-browser` (read-only architecture analysis). The architecture sub-cluster (`xuanwu-architecture-chief`, `xuanwu-architecture-refactor`, `xuanwu-diagram-designer`, `xuanwu-repo-browser`) is reachable via the `/xuanwu-architecture-realign` prompt or directly from `xuanwu-commander` and `xuanwu-orchestrator`. DDD sub-cluster: `ddd-orchestrator` (DDD delivery coordinator), `ddd-domain-modeler` (Domain Layer), `ddd-application-layer` (Application Layer), and `ddd-infrastructure` (Infrastructure Layer) — reachable via `/ddd-slice-scaffold` or from `xuanwu-orchestrator`.
7. The canonical instruction suite is `xuanwu-customization-authoring`, `xuanwu-code-quality`, `xuanwu-application-architecture`, `xuanwu-typescript-platform`, `xuanwu-github-workflows`, `xuanwu-task-tracking`, and `xuanwu-test-expert`. Additional scoped instructions: `xuanwu-coding-style` (`**/*.{ts,tsx,js,jsx}`), `xuanwu-documentation` (`**/*.md`), `xuanwu-repo-structure` (`src/**/*.{ts,tsx,js,jsx}`), `xuanwu-security` (`**/*.{ts,tsx,js,jsx,json,yaml,yml}`), `xuanwu-ddd-layers` (`src/**/*.{ts,tsx,js,jsx}` — 4-layer DDD boundary enforcement), and `xuanwu-ddd-progressive-migration` (`src/**/*.{ts,tsx,js,jsx}` — incremental migration workflow toward layered DDD).
8. The canonical prompt suite is `xuanwu-orchestrator`, `xuanwu-product`, `xuanwu-research`, `xuanwu-architect`, `xuanwu-docs`, `xuanwu-implementer`, `xuanwu-ui`, `xuanwu-ops`, and `xuanwu-test-expert`. Additional prompts: `xuanwu-planning` (quick implementation plan via `xuanwu-software-planner`), `xuanwu-refactor` (refactor guidance via `xuanwu-implementer`), `xuanwu-code-review` (code review via `xuanwu-quality`), `xuanwu-debug` (debugging via `xuanwu-sequential-thinking`), `xuanwu-architecture-realign` (architecture doc realignment via `xuanwu-architecture-chief`), and `xuanwu-ssot-sync` (sync architecture docs with Semantic Kernel SSOT via `xuanwu-architecture-chief`). DDD prompts: `ddd-domain-model`, `ddd-application-service`, `ddd-infrastructure-adapter`, `ddd-layer-audit`, `ddd-slice-scaffold`, and `ddd-progressive-layering`.
9. `breakdown-plan` is the canonical planning and backlog decomposition skill; merged wrappers `create-implementation-plan` and `gen-specs-as-issues` were removed.
10. `refactor` is the canonical refactor skill (including planning mode); merged wrapper `refactor-plan` was removed.
11. `prompt-builder` is the canonical Copilot customization and exemplar prompt-authoring skill; merged wrappers `copilot-instructions-blueprint-generator` and `code-exemplars-blueprint-generator` were removed.
12. `breakdown-epic-pm` is the canonical requirements authoring skill (PRD + tech-spec modes); merged wrapper `create-specification` was removed.
13. `next-best-practices` is the canonical Next.js skill family entrypoint; merged wrappers `next-cache-components` and `next-upgrade` were removed.
14. `agent-governance` is the canonical agent safety and governance skill; merged wrappers `agentic-eval` and `ai-prompt-engineering-safety-review` were removed.
15. `ddd-architecture` is the DDD architecture skill providing 4-layer patterns, agent kit (ddd-orchestrator, ddd-domain-modeler, ddd-application-layer, ddd-infrastructure), prompt commands, and implementation examples.
16. `ddd-progressive-layering` is the DDD migration skill for moving existing slices toward the 4-layer model with compatibility seams, ordered extraction steps, and low-risk refactor guidance.

## Required Reference Documents for Customizations

These documents are stable link targets for prompts and agents that need repository context:

- `docs/domain-glossary.md`
- `docs/project-structure.md`
- `docs/persistence-model-overview.md`
- `docs/architecture/README.md`
- `.memory/knowledge-graph.json`
- `.github/skills/xuanwu-skill/SKILL.md`

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
