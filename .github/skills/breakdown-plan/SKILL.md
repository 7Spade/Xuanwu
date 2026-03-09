---
name: breakdown-plan
description: 'Generate a comprehensive project plan with Epic > Feature > Story/Enabler > Test hierarchy, dependencies, priorities, and automated tracking. Use when decomposing a large initiative into actionable issues, planning a sprint, or creating a GitHub project backlog. Triggers: "breakdown plan", "project plan", "issue planning", "task decomposition", "sprint planning".'
---

# Breakdown Plan

## When to Use
- Decomposing a large initiative or epic into trackable tasks
- Creating a structured backlog for sprint planning
- Generating GitHub issues from a requirements document

## Prerequisites
- Have a clear goal statement or PRD (use `breakdown-epic-pm` first if needed)
- Understand the target repository and issue tracker

## Workflow
1. Parse the goal or PRD: extract the top-level epic.
2. Decompose into Features: groups of related functionality.
3. Break each Feature into Stories (user-facing) and Enablers (technical tasks).
4. Write test tasks for each Story: define what automated tests must pass.
5. Assign priorities: Critical / High / Medium / Low based on business value and risk.
6. Map dependencies: which tasks must complete before others can start.
7. Estimate complexity: S / M / L / XL for each story.
8. Format the plan as a Markdown checklist and optionally create GitHub issues.

## Output Contract
- Produce a hierarchical plan: `Epic > Feature > Story/Enabler > Test`.
- Each story must have: title, description, acceptance criteria, priority, complexity, dependencies.
- Include a dependency graph or ordered list of blocking relationships.

## Guardrails
- Do not create stories without acceptance criteria.
- Flag circular dependencies and escalate for resolution before finalizing the plan.
- Keep each story independently deliverable where possible.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
