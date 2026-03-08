---
description: 'Guidelines for creating custom agent files for GitHub Copilot'
applyTo: '**/*.agent.md'
---

# Custom Agent Rules

Use these rules for `*.agent.md` files.

## File and Naming Rules

- MUST store repository agents in `.github/agents/`.
- MUST use lowercase, hyphenated filenames ending with `.agent.md`.
- SHOULD align filename and agent purpose (for discovery and maintainability).

## Frontmatter Rules

- MUST provide `description`.
- SHOULD provide `name`, `tools`, and `model` when supported by target environment.
- MAY provide `target`, `infer`, and `handoffs` when required by workflow.
- MUST keep YAML valid and consistent.

## Description and Scope Rules

- MUST state agent specialization, expected task types, and boundaries.
- MUST define what the agent does and what it must avoid.
- SHOULD describe expected output format for predictable behavior.

## Tool Access Rules

- MUST apply least privilege when selecting `tools`.
- MUST include only tools required for the agent's mission.
- SHOULD avoid enabling `execute` unless the agent explicitly needs shell operations.

## Handoff Rules (when used)

- MUST use action-oriented labels and clear prompts.
- MUST reference valid target agents.
- SHOULD limit to meaningful workflow transitions rather than exhaustive links.

## Orchestration Rules

- MUST pass minimal context to sub-agents (paths, IDs, expected outputs).
- MUST require sub-agents to follow their own `.agent.md` spec.
- MUST remember parent tool permissions are the ceiling for all sub-agents.
- SHOULD avoid deep orchestration chains for large-scale bulk processing.

## Variable Rules

- SHOULD define required/optional variables when workflows are parameterized.
- MUST validate critical inputs before execution.
- MUST use clear variable names and avoid ambiguous placeholders.

## Security Rules

- MUST NOT embed secrets in agent files.
- MUST pass secrets through approved secret mechanisms only.
- SHOULD document any destructive or high-impact behavior explicitly.

## Quality Rules

- MUST keep prompts concise, non-redundant, and unambiguous.
- MUST test agent behavior with representative tasks.
- SHOULD review compatibility differences across VS Code and GitHub.com before relying on advanced properties.
