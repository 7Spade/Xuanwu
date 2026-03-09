---
name: create-vertical-slice
description: 'Create a vertical slice implementation plan with clear UI/Application/Domain/Infrastructure boundaries.'
agent: 'agent'
tools: ['search/codebase', 'edit/editFiles', 'read', 'software-planning/*']
argument-hint: 'Name and purpose of the new slice, e.g.: VS10-Reporting — analytics reporting slice'
---

# Vertical Slice Implementation Guide

Design and implement a new slice with strict boundary discipline.

## Steps
1. Define scope and public API.
2. Place code by layer responsibility.
3. Keep writes in action/application boundaries.
4. Validate dependency direction and cross-slice access rules.

## Output
- Proposed file tree
- Minimal implementation sequence
- Boundary risk checklist
