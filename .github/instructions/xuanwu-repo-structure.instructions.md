---
name: Xuanwu Repository Structure
description: Standard repository structure and module organization
applyTo: "**"
---

# Repository Structure Rules

Follow a clear and modular project structure.

## Top-level folders

Use the following structure when possible:

- src/ — application source code
- components/ — reusable UI components
- features/ — feature modules
- services/ — business logic or API services
- lib/ — shared utilities
- tests/ — unit and integration tests
- docs/ — documentation
- scripts/ — build or automation scripts

## Module organization

Each feature module should contain:

- index file (public exports)
- implementation files
- test files
- documentation if complex

Example

feature/
  feature.service.ts
  feature.types.ts
  feature.test.ts

## Rules

- Avoid deeply nested directories.
- Group code by feature rather than by technical layer when possible.
- Keep modules small and cohesive.