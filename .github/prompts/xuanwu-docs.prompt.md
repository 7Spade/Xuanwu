---
name: xuanwu-docs
description: 'Write and synchronize Xuanwu documentation: technical docs, ADRs, architecture sync, memory governance, and knowledge-graph cleanup.'
agent: 'xuanwu-docs'
argument-hint: 'Describe the documentation task, e.g.: write ADR for CQRS gateway | sync architecture docs with workspace slice'
---

# Xuanwu Documentation Workflow

This prompt consolidates the repository's documentation and architecture-doc maintenance commands.

## Modes

1. **Documentation writing** — create or update docs using an appropriate Diátaxis-style output.
2. **ADR authoring** — capture architecture decisions in stable long-form records.
3. **Architecture sync** — reconcile authoritative docs with implementation reality.
4. **Knowledge governance** — prune stale memory or knowledge-graph records and re-sync verified facts.

## Guardrails

- Update documents, not application code, unless the task explicitly includes both.
- Keep authoritative files consistent with repository reality.
- Prefer existing documents over creating parallel references.

Task: ${input:task:Describe the documentation or governance task}
