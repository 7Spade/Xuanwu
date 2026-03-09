---
name: create-technical-spike
description: 'Create a time-boxed technical spike document to investigate unknowns and validate decisions before implementation. Use when facing architectural uncertainty, evaluating libraries, or prototyping risky approaches. Triggers: "technical spike", "create spike", "research spike", "spike document", "prototype", "investigate unknown".'
---

# Create Technical Spike

## When to Use
- A technical decision carries significant uncertainty or risk
- Evaluating two or more implementation approaches before committing
- A feature requires a throwaway prototype to validate feasibility

## Prerequisites
- Define the specific question the spike must answer
- Agree on the time box (typically 1–3 days)
- Identify success criteria: what result confirms or rejects the hypothesis

## Workflow
1. State the spike goal: one sentence describing the unknown to resolve.
2. Define the hypothesis: the expected answer and why it is believed.
3. Set the time box: maximum effort before a decision must be made.
4. List acceptance criteria: specific, observable outcomes that answer the question.
5. Outline the investigation approach: steps, tools, and resources to consult.
6. Define the fallback plan if the hypothesis is disproved.
7. Write findings and decision in the spike doc after investigation.
8. Save the spike under `docs/` or a dedicated `spikes/` directory.

## Output Contract
- Produce a Markdown spike doc with: Goal, Hypothesis, Time Box, Acceptance Criteria, Approach, Findings, Decision.
- Findings section MUST be completed after investigation — do not leave it blank.
- Decision MUST be one of: Proceed / Reject / Needs More Investigation.

## Guardrails
- Do not allow the spike to grow beyond the agreed time box.
- Do not implement production code during a spike — throwaway prototypes only.
- Stop and report if acceptance criteria cannot be evaluated within the time box.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
