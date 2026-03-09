---
description: "Rules to keep README and docs synchronized with code, API, and configuration changes."
applyTo: "**/*.{md,ts,tsx,js,jsx,mjs,cjs,yml,yaml,json}"
---

# Documentation Sync Rules

## Update Triggers

- MUST update documentation when features, behavior, or public interfaces change.
- MUST update documentation when setup, configuration, or environment variables change.
- MUST update documentation when CLI commands, scripts, or operational runbooks change.
- MUST add migration notes for breaking changes.

## Required Files

- MUST update `README.md` when user-facing capabilities or setup flow changes.
- MUST update affected docs under `docs/` when architecture, API, or domain behavior changes.
- SHOULD update changelog-style records when the project uses them.

## Content Quality

- MUST keep docs accurate, concise, and consistent with current code behavior.
- MUST keep code examples runnable and aligned with current signatures.
- MUST document constraints, defaults, and failure modes for public APIs/configuration.
- MUST avoid documenting features that are not implemented.

## Verification

- MUST verify links and command examples after documentation edits.
- SHOULD run available docs lint/check scripts when present.
- MUST treat missing documentation updates as incomplete implementation.

## Review Checklist

- MUST confirm README reflects current project state.
- MUST confirm changed APIs/configuration are documented.
- MUST confirm breaking changes include migration guidance.
