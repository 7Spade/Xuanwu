---
name: "Agent Skill Authoring Rules"
description: "Authoring rules for high-quality SKILL.md files used by Copilot agent skills."
applyTo: "**/{.github,.claude}/skills/**/SKILL.md"
---

# Agent Skill Authoring Rules

## Structure

- MUST place each skill in its own folder.
- MUST include one `SKILL.md` entry file per skill folder.
- SHOULD move long procedures into `references/` and keep `SKILL.md` focused.

## Frontmatter

- MUST provide `name` and `description` in YAML frontmatter.
- MUST use lowercase, hyphenated `name` values.
- SHOULD keep `name` within 64 characters.

## Discovery

- MUST write `description` as a discoverable intent sentence.
- MUST state what the skill does, when to use it, and trigger keywords.
- MUST avoid vague descriptions that cannot be matched from user prompts.

## Content

- MUST write instructions as imperative, testable rules.
- SHOULD include prerequisites, workflow steps, failure handling, and references.
- MUST keep examples consistent with current tool behavior.

## Resource and Safety

- MAY include `scripts/`, `references/`, `assets/`, and `templates/`.
- MUST treat `assets/` as static and `templates/` as editable starter content.
- MUST use relative links inside the skill folder.
- MUST document destructive actions and required confirmations.
- MUST NOT embed credentials, tokens, or secrets.