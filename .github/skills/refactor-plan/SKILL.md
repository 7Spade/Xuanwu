---
name: refactor-plan
description: 'Wrapper skill. Refactor planning is consolidated into refactor planning mode. Use this alias for safe phased refactor sequencing. Triggers: "plan refactor", "refactor roadmap", "multi-file refactor", "refactor sequence".'
---

# Refactor Plan (Wrapper)

This skill remains as a compatibility alias.

Canonical refactor workflow is now in:
- `../refactor/SKILL.md`

## Delegation
When invoked, run `refactor` with planning-first behavior:
1. Build dependency graph and move map.
2. Sequence in verifiable phases with rollback checkpoints.
3. Enforce verification after each phase.

## Output Contract
- Preserve legacy trigger compatibility.
- Produce phased refactor plans consistent with `refactor`.
- Keep refactor-specific safety gates and rollback checkpoints.

## Guardrails
- Do not duplicate or fork refactor planning rules here.
- Keep this file as a thin alias only.

## Source of Truth
- Canonical: `../refactor/SKILL.md`
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
