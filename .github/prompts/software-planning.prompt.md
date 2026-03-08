---
name: tool-software-planning
description: 'Use software-planning to break down complex feature implementations into task checklists. Required for multi-day development tasks to avoid scope creep.'
tools: [software-planning]
---

# Software Planning

## When To Use This Tool

Invoke `software-planning` when a task meets any of the following criteria:

1. **Estimated > 4 hours:** The feature spans multiple layers or multiple files.
2. **Risk of Cascading Changes:** Modifying shared infrastructure (Events, Projections, Aggregates).
3. **Uncertainty:** The implementation direction needs to be confirmed before starting.

## Standard Planning Steps

### Phase 1: Objective Definition

Use `start_planning` to establish the main goal. The goal must be specific, measurable, and bounded.

### Phase 2: Task Decomposition

Use `add_todo` to break down each sub-task:

- Complexity 1–3: Small isolated changes (single file)
- Complexity 4–6: Medium changes (cross-layer)
- Complexity 7–10: Complex changes (require design review)

### Phase 3: Execution Tracking

Use `update_todo_status` to update completion status in real time and avoid scope creep.

## Integration With Other Tools

- **Before planning:** Use `tool-repomix` to scan the codebase and understand existing implementation.
- **Before high-complexity tasks:** Use `tool-thinking` to validate technical feasibility.
