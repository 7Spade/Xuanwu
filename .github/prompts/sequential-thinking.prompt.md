---
name: tool-sequential-thinking
description: 'Use sequential-thinking for iterative analytical reasoning. Required for multi-step problem decomposition, risk assessment, architecture decisions, and controversial trade-offs.'
tools: [sequential-thinking]
---

# Sequential Thinking

## When To Use This Tool

You must invoke `sequential-thinking` when encountering any of the following:

1. **Multi-Step Problem Decomposition:** A task requires more than 3 logical steps to execute.
2. **Risk Assessment:** Evaluating whether an architecture decision will cause chain reactions.
3. **Controversial Trade-Offs:** Choosing between two or more technically viable paths.
4. **Root Cause Inference:** Tracing backward from a bug to its architectural root cause.

## Thinking Framework Template

```
Thought 1: Understand the current state — describe the problem as-is.
Thought 2: Identify constraints — boundary conditions and inviolable rules.
Thought 3: Explore paths — list at least 2 possible solutions.
Thought 4: Risk Assessment — analyze the risks and side effects of each solution.
Thought 5: Decision — select the best solution with justification.
Thought 6: Verification — check the decision against project documentation.
```

## Output Standards

- Each thought must be explicit and self-complete.
- The final conclusion must clearly state "selected solution" and "reasons for rejecting alternatives."
