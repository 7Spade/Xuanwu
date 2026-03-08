---
description: 'Guidelines for creating high-quality Agent Skills for GitHub Copilot'
applyTo: '**/.github/skills/**/SKILL.md, **/.claude/skills/**/SKILL.md'
---

# Agent Skills Rules

Use these rules when authoring `SKILL.md` files.

## Scope Rules

- MUST place each skill in its own folder under `.github/skills/<skill-name>/` or `.claude/skills/<skill-name>/`.
- MUST include a `SKILL.md` file in every skill folder.

## Frontmatter Rules

- MUST provide `name` and `description` in YAML frontmatter.
- MUST use lowercase, hyphenated `name` values with max 64 characters.
- SHOULD include `license` (SPDX or `Complete terms in LICENSE.txt`).

## Discovery Rules

- MUST write `description` as the primary discovery signal.
- MUST state WHAT the skill does, WHEN to use it, and relevant trigger keywords.
- MUST avoid vague descriptions that cannot be matched from user prompts.

## Content Rules

- MUST keep instructions imperative, explicit, and task-oriented.
- SHOULD include: usage scenarios, prerequisites, workflows, troubleshooting, and references.
- SHOULD move long workflows to `references/` and keep `SKILL.md` concise.

## Resource Rules

- MAY add `scripts/`, `references/`, `assets/`, and `templates/`.
- MUST treat `assets/` as static files used as-is.
- MUST treat `templates/` as starter content the agent is expected to modify.
- MUST use relative links for all in-skill references.

## Script and Security Rules

- SHOULD prefer portable script runtimes (`python`, `pwsh`, `node`, shell).
- MUST provide clear script usage/error behavior for non-trivial scripts.
- MUST NOT hardcode credentials or secrets.
- MUST document destructive flags/operations explicitly.

## Quality Rules

- MUST keep `SKILL.md` focused and deduplicated.
- SHOULD keep `SKILL.md` under ~500 lines by extracting detail docs.
- MUST ensure every rule/example reflects current behavior and is testable.