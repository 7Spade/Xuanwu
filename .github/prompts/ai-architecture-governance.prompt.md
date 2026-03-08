---
name: ai-architecture-governance
description: 'Architecture governance controller for Next.js + Firebase + Genkit work. Enforce SSOT and hard invariants before implementation.'
agent: 'agent'
---

# AI Architecture Governance Master

## Goal
Keep every architectural decision aligned with the project SSOT and governance rules.

## Required context (read first)
- [docs/architecture/00-LogicOverview.md](../../docs/architecture/00-LogicOverview.md) (highest priority)
- [docs/knowledge-graph.json](../../docs/knowledge-graph.json)
- [skills/SKILL.md](../../skills/SKILL.md)

## Workflow
1. Load relevant repo context and impacted files.
2. Check layer direction, boundary rules, authority exits, and naming consistency.
3. Flag violations with exact file paths and minimal remediation steps.
4. If requirements are unclear, ask clarification before proposing structural changes.

## Output
Return:
- Compliance summary (pass/fail by rule)
- Violation list (file:line + rule)
- Minimal change plan
