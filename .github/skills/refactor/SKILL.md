---
name: refactor
description: 'Surgical code refactoring to improve maintainability without changing behavior. Covers extracting functions, renaming variables, breaking down god functions, improving type safety, eliminating code smells, and applying design patterns. Less drastic than repo-rebuilder; use for gradual improvements.'
license: MIT
---

# Refactor

## Intent
Surgical code refactoring to improve maintainability without changing behavior. Covers extracting functions, renaming variables, breaking down god functions, improving type safety, eliminating code smells, and applying design patterns. Less drastic than repo-rebuilder; use for gradual improvements.

## Inputs
- User goal and expected deliverable
- Relevant repository context or existing artifacts
- Constraints (time, scope, quality, security/compliance)

## Workflow
1. Confirm scope and ask targeted clarifying questions when required.
2. Produce a concise, execution-ready plan focused on the stated goal.
3. Execute the domain-specific work implied by this skill's intent.
4. Validate quality, safety, and completeness before finalizing output.
5. Return concrete results with assumptions, decisions, and next actions.

## Output Contract
- Deliverables must be actionable, deterministic, and easy to review.
- Use clear sections and checklists when they improve execution clarity.
- Keep output concise while preserving all required decisions and risks.

## Guardrails
- Follow repository conventions and existing architecture boundaries.
- Do not expose secrets or sensitive data.
- Flag unresolved risks, dependencies, and follow-up work explicitly.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
