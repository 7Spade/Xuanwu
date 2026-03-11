---
name: agentic-eval
description: |
  Patterns and techniques for evaluating and improving AI agent outputs. Use this skill when:
  - Implementing self-critique and reflection loops
  - Building evaluator-optimizer pipelines for quality-critical generation
  - Creating test-driven code refinement workflows
  - Designing rubric-based or LLM-as-judge evaluation systems
  - Adding iterative improvement to agent outputs (code, reports, analysis)
  - Measuring and improving agent response quality
---

# Agentic Eval

## When to Use
- An agent produces inconsistent or low-quality outputs that need a quality gate
- Building a self-critique loop where the agent reviews its own output before returning it
- Designing an LLM-as-judge pipeline to score and rank generated responses
- Creating test-driven refinement where generated code must pass tests to be accepted

## Prerequisites
- Define the quality dimensions to evaluate: correctness, completeness, clarity, safety
- Choose the evaluation strategy: rule-based, rubric-based, or LLM-as-judge
- Have examples of good and bad outputs to calibrate the evaluator

## Workflow
1. Define evaluation criteria as a rubric: each dimension with a 1–5 scale and description.
2. Implement the evaluator: rule-based checks first, then LLM-as-judge for subjective dimensions.
3. Build the feedback loop: if score < threshold, feed evaluation back to the generator for revision.
4. Set a maximum iteration limit (typically 3) to prevent infinite loops.
5. Log each iteration: generation, scores, feedback, and final output.
6. Validate the evaluator itself: test it against known good and bad examples.
7. Measure improvement rate: track how often revision improves the score.

## Output Contract
- Produce the evaluator implementation and the refinement loop logic.
- Include calibration examples: at least two "good" and two "bad" outputs with expected scores.
- Document the rubric, threshold values, and iteration limit.

## Guardrails
- Do not use LLM-as-judge without calibration — it must be tested against known examples first.
- Do not allow the refinement loop to exceed the iteration limit.
- Do not expose evaluation prompts or rubrics to end users.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
