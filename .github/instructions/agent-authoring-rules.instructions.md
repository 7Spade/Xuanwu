---
name: "Agent Authoring Rules"
description: "Authoring rules for custom agent definition files (*.agent.md)."
applyTo: "**/*.agent.md"
---

# Custom Agent Authoring Rules

## Naming and Location

- MUST place repository-scoped agents under `.github/agents/`.
- MUST use lowercase, hyphenated filenames ending in `.agent.md`.
- SHOULD align filename wording with the agent's actual responsibility.

## Frontmatter

- MUST provide `description`.
- SHOULD provide `name`, `tools`, and `model` when supported.
- MAY provide `target`, `infer`, and `handoffs` when workflow requires them.
- MUST keep YAML valid and internally consistent.

## Scope and Behavior

- MUST define specialization, input expectations, and output expectations.
- MUST define explicit boundaries, including forbidden behaviors.
- MUST keep prompts concise, deterministic, and non-redundant.

## Tool Permissions

- MUST apply least privilege to `tools`.
- MUST enable only tools required for the agent mission.
- SHOULD avoid execution-capable tools unless strictly needed.

## Orchestration

- MUST pass only minimum required context to sub-agents.
- MUST ensure sub-agents follow their own specs.
- MUST treat parent permissions as the hard ceiling for all sub-agents.
- SHOULD avoid deep or circular handoff chains.

## Security and Quality

- MUST NOT place secrets in agent files.
- MUST document destructive operations and preconditions.
- MUST validate representative tasks before adoption.
