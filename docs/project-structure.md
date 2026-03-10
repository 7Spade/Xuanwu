# Project Structure

This document provides a stable high-level map of the repository for Copilot prompts, agents, and reviewers.

## Top-Level Layout

| Path | Purpose |
| --- | --- |
| `.github/` | Repository-scoped Copilot customizations, workflows, and templates |
| `docs/` | Architecture, Copilot customization references, and operational documentation |
| `skills/` | Repository reference artifact used as a codebase map and SSOT companion |
| `src/` | Application, feature slices, shared kernel, and shared infrastructure |
| `public/` | Static assets and localization files |

## Copilot Customization Layout

| Path | Purpose |
| --- | --- |
| `.github/copilot-instructions.md` | Always-on repository instructions |
| `.github/agents/` | Custom agents |
| `.github/hooks/` | Workspace hook JSON and hook helper scripts |
| `.github/instructions/` | Scoped instruction files |
| `.github/prompts/` | Slash-command prompt files |
| `.github/skills/` | Project Agent Skills |

See `.github/README.md` for the detailed customization development guide.

## Application Layout

| Path | Purpose |
| --- | --- |
| `src/app/` | Next.js App Router entrypoints |
| `src/features/` | Business feature slices and cross-cutting authorities |
| `src/shared-kernel/` | Pure contracts, constants, and shared types |
| `src/shared-infra/` | Infrastructure adapters, gateways, routing, and observability |
| `src/app-runtime/` | Runtime providers, contexts, and AI orchestration support |

## Architecture References

- `docs/architecture/00-logic-overview.md`
- `docs/architecture/03-infra-mapping.md`
- `.memory/knowledge-graph.json`
