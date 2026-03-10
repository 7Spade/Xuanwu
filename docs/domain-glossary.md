# Domain Glossary

This document is the stable entry point for repository terminology used by Copilot prompts, agents, and reviews.

## Canonical Sources

Use these sources in order when validating names and concepts:

1. `docs/architecture/00-logic-overview.md` — canonical architecture, layer, and authority vocabulary
2. `.memory/knowledge-graph.json` — canonical entity semantics and relationships
3. `skills/SKILL.md` — repository-wide implementation reference and codebase map

## Core Vocabulary

### Architecture layers

- `L0`–`L10` follow the layer model defined in `docs/architecture/00-logic-overview.md`
- `VS0-Kernel` means `src/shared-kernel/*`
- `VS0-Infra` means `src/shared-infra/*`

### Domain slices

- `VS1` Identity
- `VS2` Account
- `VS3` Skill XP
- `VS4` Organization
- `VS5` Workspace
- `VS6` Workforce Scheduling
- `VS7` Notification Hub
- `VS8` Semantic Graph

### Cross-cutting authorities

- `global-search.slice` is the search authority
- `notification-hub.slice` is the notification authority

## Usage Rules

- New identifiers should match the terminology in the canonical sources above.
- If a proposed term conflicts with the SSOT documents, update the knowledge source before using the new term in prompts, docs, or code.
- Treat this document as an index into the true SSOT documents, not as a replacement for them.
