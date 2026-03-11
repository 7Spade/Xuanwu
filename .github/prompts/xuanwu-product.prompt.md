---
name: xuanwu-product
description: 'Refine requirements, build implementation plans, generate blueprints, and produce risk-aware decisions for Xuanwu feature work.'
agent: 'xuanwu-product'
argument-hint: 'Describe the feature, issue, or planning task, e.g.: refine workspace invite flow | generate tech-stack blueprint'
---

# Xuanwu Product Workflow

This prompt consolidates the old planning and blueprint-oriented commands into one project-specific workflow.

## Modes

1. **Requirement refinement** — acceptance criteria, edge cases, NFRs, and scope boundaries.
2. **Implementation planning** — phased task breakdown with dependencies and validation steps.
3. **Blueprint generation** — produce practical architecture or technology-stack blueprints from repository evidence.
4. **Decision support** — apply structured multi-step reasoning when trade-offs must be explicit.

## Output

- Scope summary
- Constraints and risks
- Recommended execution plan or blueprint
- Clear next handoff if implementation should continue elsewhere

Task: ${input:task:Describe the product/planning task}
