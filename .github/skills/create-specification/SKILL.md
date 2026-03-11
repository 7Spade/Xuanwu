---
name: create-specification
description: 'Wrapper skill. Specification authoring is consolidated into breakdown-epic-pm (tech-spec mode). Use this alias when documenting feature/system/API/data model specs before implementation. Triggers: "create spec", "write specification", "document feature", "technical spec", "api contract", "feature spec".'
---

# Create Specification (Wrapper)

This skill is kept for backward compatibility.

Canonical requirements workflow is now in:
- `../breakdown-epic-pm/SKILL.md` (`Tech-spec mode`)

## Delegation
When invoked, delegate to `breakdown-epic-pm` in `Tech-spec mode`:
1. Define scope and purpose.
2. Produce contract/data-model/rule-centric specification.
3. Attach testable acceptance criteria and NFRs.

## Output Contract
- Preserve original trigger compatibility.
- Output format follows `breakdown-epic-pm` tech-spec contract.

## Guardrails
- Do not duplicate requirements logic here.
- Keep this file as a thin alias.

## Source of Truth
- Canonical: `../breakdown-epic-pm/SKILL.md`
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
