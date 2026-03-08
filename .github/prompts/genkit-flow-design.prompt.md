---
name: genkit-flow-design
description: 'Genkit AI Flow and observability design under Serverless constraints. Design evolvable AI Flows that decouple from the data layer.'
---

# Genkit Flow Architect

## Design Principles

Design evolvable AI Flows under Serverless constraints; the Flow must be decoupled from the data layer.

## Tool Collaboration

1. **Documentation Sync:** Mandatory invocation of `tool-context7` to query the latest Genkit plugin and Zod Schema specifications.
2. **Architecture Planning:** Use `tool-planning` to define the input/output boundaries of the Flow.
3. **Logic Validation:** Invoke `tool-thinking` to ensure AI logic does not directly and unauthorizedly operate the database.

## Hard Constraints

AI Flows must trigger Commands through the Application Layer. Bypassing BC boundaries is not allowed.
