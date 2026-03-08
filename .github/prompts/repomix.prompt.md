---
name: tool-repomix
description: 'Use repomix to pack the codebase into context and scan docs/. Essential prerequisite before any architecture design, cross-file refactoring, or large-scale analysis.'
tools: [repomix]
---

# Repository Context Loading

## Mandatory Pre-Processing Steps

Before executing any of the following task types, you **must** invoke `pack_codebase` to load repository context:

1. **Architecture Design:** Creating or modifying BC boundaries, Event flows, Aggregate structures.
2. **Cross-File Refactoring:** Renaming, moving, or splitting modules spanning 3 or more files.
3. **Documentation Sync:** Verifying that code aligns with `docs/*.md`.
4. **Root Cause Analysis:** Analyzing complex bugs arising from multi-layer interactions.

## Invocation Method

1. Invoke `pack_codebase` with the relevant directory as the `directory` parameter.
2. If the target is `docs/`, use `docs/` as the root to obtain full Architecture overview context.

## Output Processing

After packing is complete, extract key information:

- **Project Structure:** Main modules and their responsibilities.
- **Layer Boundaries:** Server vs. Client Component boundary locations.
- **Dependency Graph:** Key imports and potential circular dependencies.
