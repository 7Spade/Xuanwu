---
description: Practical rules for VS Code custom instructions, prompts, agents, and skills.
applyTo: ".github/{agents,instructions,prompts,skills}/**/*"
---

# VS Code Customization Implementation Rules

## File Roles

- `.github/instructions/*.instructions.md`: always-on rules with optional `applyTo` globs.
- `.github/prompts/*.prompt.md`: reusable task templates and output contracts.
- `.github/agents/*.agent.md`: role agents with explicit model and tool scopes.
- `.github/skills/**/SKILL.md`: reusable workflow capabilities with references and validation checklists.

## Authoring

- Keep frontmatter valid and minimal.
- Use stable, descriptive names and avoid duplicate ownership.
- Prefer one canonical workflow per concern.

## Tooling Alignment

- Agent tool IDs must match workspace MCP server keys.
- For this repository, Serena-related tooling uses:
  - `io.github.upstash/context7`
  - `sequentialthinking`
  - `oraios/serena`

## Diagnostics

- Use VS Code Chat Diagnostics to confirm loaded customization files and identify loading errors.
