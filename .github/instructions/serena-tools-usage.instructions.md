---
name: "Serena Tools & Instructions Authoring"
description: "Serena tool usage guidelines and custom instructions authoring rules for this repository."
applyTo: ".github/instructions/**"
---

# Serena Tools & Custom Instructions Authoring Rules

## Purpose

Apply these rules when creating or editing `.instructions.md` files in this repository, or when using Serena tools.

## Custom Instructions File Format

Every `.instructions.md` file MUST follow the spec in `docs/copilot/customization/custom-instructions.md`:

- MUST include YAML frontmatter with at minimum `name`, `description`, and `applyTo` fields.
- MUST use a top-level `#` heading immediately after the frontmatter.
- MUST write body content as imperative, testable Markdown rules.
- MUST NOT embed raw YAML frontmatter blocks inside the body — wrap examples in fenced code blocks.

Example frontmatter template:

```markdown
---
name: "My Rule Name"
description: "Short description of what these rules enforce and when they apply."
applyTo: "src/**/*.{ts,tsx}"
---

# My Rule Name

## Section

- MUST do X because of reason Y.
- SHOULD do Z when condition W applies.
```

## Authoring Best Practices

- MUST keep instructions short and self-contained — each rule is a single, actionable statement.
- MUST include reasoning behind non-obvious rules (explain *why*, not just *what*).
- MUST scope `applyTo` to the narrowest file set that makes sense; avoid `**/*` unless truly universal.
- MUST NOT store secrets, credentials, or sensitive data in instruction files.
- SHOULD reference related docs with Markdown links instead of duplicating content.

## Serena Tool Safety Rules

- MUST NOT request, return, or embed secrets or personal credentials.
- MUST require explicit human confirmation for any operation that mutates remote state (push, deploy, delete).
- MUST list allowed tools and scope explicitly in any agent-facing instruction file.
- SHOULD use environment variables for any external API keys; reference the variable name, not the value.

## Maintenance

- MUST verify instruction files against `docs/copilot/customization/custom-instructions.md` when VS Code Copilot updates the spec.
- MUST run `npm run check` after editing instruction files to confirm no downstream lint errors.
