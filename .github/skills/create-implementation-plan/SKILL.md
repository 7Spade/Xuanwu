---
name: create-implementation-plan
description: 'Create a structured implementation plan covering phases, tasks, dependencies, and success criteria. Use when planning new features, architectural changes, package upgrades, or major refactors before coding begins. Triggers: "implementation plan", "create plan", "dev plan", "feature plan", "task breakdown", "phase plan".'
---

# Create Implementation Plan

## When to Use
- Starting work on a new feature that spans multiple files or layers
- Planning an architectural change or package upgrade
- Need a phased approach with checkpoints before committing to code

## Prerequisites
- Clarify goal, scope, and constraints with the user
- Review relevant architecture docs: `docs/architecture/00-logic-overview.md`
- Identify affected features and their current state

## Workflow
1. Define the goal in one sentence and confirm it with the user.
2. Identify all affected files, modules, and external dependencies.
3. Break work into phases (≤5 tasks per phase) with a clear deliverable for each.
4. Sequence phases bottom-up: foundational changes first, UI last.
5. For each task, specify: description, files affected, acceptance criteria.
6. Identify risks and blockers; mark tasks that need spikes or research.
7. Write the plan to `.copilot-tracking/plans/` in Markdown checklist format.

## Output Contract
- One Markdown file per plan under `.copilot-tracking/plans/`.
- Format: `## Phase N: Title`, then `- [ ] Task description (files: ..., criteria: ...)`.
- Include a "Success Criteria" section at the end covering the overall goal.

## Guardrails
- Do not include implementation code in the plan — only task descriptions.
- Flag tasks with architecture boundary concerns before proceeding.
- Do not finalize the plan without user confirmation on scope.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- Plan tracking: `.copilot-tracking/plans/`
