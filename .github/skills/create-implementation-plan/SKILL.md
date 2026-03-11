---
name: create-implementation-plan
description: 'Wrapper skill. Planning is consolidated into breakdown-plan. Use this alias when you need phased implementation planning with dependencies and acceptance criteria. Triggers: "implementation plan", "create plan", "dev plan", "feature plan", "task breakdown", "phase plan".'
---

# Create Implementation Plan (Wrapper)

This skill is kept for backward compatibility.

Canonical planning workflow is now in:
- `../breakdown-plan/SKILL.md`

## Delegation
When invoked, use `breakdown-plan` and select the implementation planning mode:
1. Parse goal/scope and constraints.
2. Build phased plan with dependencies and acceptance criteria.
3. Output checklist-ready plan with verification steps.

## Output Contract
- Preserve the original trigger terms and entrypoint behavior.
- Produce the same deliverable shape as `breakdown-plan`.
- Reference `breakdown-plan` as the source of active workflow rules.

## Guardrails
- Do not duplicate planning logic here.
- Do not diverge from `breakdown-plan` semantics.

## Source of Truth
- Canonical: `../breakdown-plan/SKILL.md`
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
