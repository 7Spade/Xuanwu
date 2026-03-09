---
name: first-ask
description: 'Interactive task-refinement workflow that interrogates scope, deliverables, and constraints before carrying out any task. Use before starting any complex or ambiguous request to surface hidden assumptions. Requires the Joyride VS Code extension. Triggers: "first ask", "clarify task", "scope questions", "refine request", "before starting".'
---

# First Ask

## When to Use
- A task description is ambiguous or underspecified
- Multiple valid interpretations exist and picking the wrong one would waste significant effort
- A new project or feature kickoff where scope needs explicit alignment

## Prerequisites
- Joyride VS Code extension must be installed and active
- User must be available for interactive Q&A

## Workflow
1. Parse the user's request to identify ambiguities and unstated assumptions.
2. Generate a focused set of ≤5 clarifying questions covering:
   - Scope: what is in and out of scope?
   - Deliverable: what does "done" look like?
   - Constraints: time, tech stack, quality, security limits?
   - Dependencies: what must be ready before this can start?
   - Priority: if trade-offs arise, what matters most?
3. Present questions interactively via the Joyride input tool.
4. Collect and summarize answers.
5. Confirm the refined scope with the user before proceeding.
6. Begin the actual task only after scope is confirmed.

## Output Contract
- Produce a confirmed scope summary before task execution begins.
- The summary must include: Goal, Deliverable, Out of Scope, Constraints, Success Criteria.

## Guardrails
- Do not start implementing before the scope is confirmed.
- Do not ask more than 5 questions — prioritize the highest-impact unknowns.
- If the user declines to answer, proceed with the most conservative interpretation and state assumptions explicitly.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
