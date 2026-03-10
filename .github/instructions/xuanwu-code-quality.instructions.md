---
name: "Xuanwu Code Quality Rules"
description: "Project-specific code generation rules for context quality, documentation sync, secure coding, and intent-focused commenting."
applyTo: "**/*.{ts,tsx,js,jsx,md,json,yml,yaml}"
---

# Xuanwu Code Quality Rules

## Context and Change Quality

- MUST use descriptive paths, names, and public boundaries so generated context stays clear.
- MUST complete dependency chains by slice or workflow instead of leaving disconnected micro-diffs.
- SHOULD reference an existing in-repo implementation pattern before introducing a new structure.

## Documentation Sync

- MUST update `README.md` or affected docs when user-facing behavior, setup, configuration, or public interfaces change.
- MUST keep documentation accurate and avoid documenting unimplemented behavior.
- SHOULD prefer updating existing docs over creating parallel documentation.

## Secure Coding

- MUST enforce least privilege and validate untrusted input at boundaries.
- MUST avoid shell interpolation, unsafe HTML rendering, and hardcoded secrets.
- SHOULD explain security-sensitive trade-offs when proposing risky changes.

## Comments

- MUST write self-explanatory code first.
- MUST add comments only for intent, constraints, trade-offs, or non-obvious behavior.
- MUST remove stale comments or commented-out dead code during refactors.
