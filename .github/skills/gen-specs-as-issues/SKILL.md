---
name: gen-specs-as-issues
description: 'Wrapper skill. Backlog decomposition and issue-spec generation are consolidated into breakdown-plan. Use this alias when converting requirements into prioritized issue specs. Triggers: "gen specs", "create issues", "feature gaps", "spec to issues", "backlog generation".'
---

# Gen Specs As Issues (Wrapper)

This skill is retained as a compatibility alias.

Canonical backlog planning workflow is now in:
- `../breakdown-plan/SKILL.md`

## Delegation
When invoked, delegate to `breakdown-plan` in backlog/issue mode:
1. Parse requirements and find gaps.
2. Prioritize and map dependencies.
3. Emit issue-ready specs with acceptance criteria.

## Output Contract
- Preserve original trigger compatibility.
- Output follows `breakdown-plan` hierarchy and issue-spec shape.

## Guardrails
- Do not fork planning/decomposition rules in this alias.
- Keep this file as a thin delegation layer.

## Source of Truth
- Canonical: `../breakdown-plan/SKILL.md`
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
