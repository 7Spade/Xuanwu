---
name: memory-merger
description: 'Merge mature lessons from a domain memory file into its instruction file to make AI guidance permanent. Use when a memory file has grown stale and its lessons should be promoted to standing instructions. Syntax: `/memory-merger >domain [scope]` where scope is `global` (default), `user`, `workspace`, or `ws`. Triggers: "memory merger", "promote memory", "merge lessons", "update instructions from memory".'
---

# Memory Merger

## When to Use
- A domain memory file contains validated lessons ready to become permanent rules
- Copilot is repeating mistakes that memory has already solved — time to promote to instructions
- Performing periodic memory hygiene to keep the memory store lean

## Prerequisites
- Identify the target domain (e.g., `auth`, `finance`, `testing`)
- Confirm the scope: `global` (`.github/copilot-instructions.md`), `user` (VS Code user settings), or `workspace` / `ws`
- Have write access to both the memory file and the target instruction file

## Usage Syntax

```
/memory-merger >domain [scope]
```

- `>domain` — the domain key used in the memory system (e.g., `>auth`, `>testing`)
- `scope` — where to merge: `global` (default), `user`, `workspace`, `ws`

## Workflow
1. Read the memory file for the specified domain.
2. Identify entries that are stable (used in >2 sessions) and no longer exploratory.
3. Group related lessons into rule statements (MUST / SHOULD / MAY).
4. Insert the rules into the appropriate section of the target instruction file.
5. Remove merged entries from the memory file.
6. Confirm the memory file still holds only active, exploratory context.
7. Report: entries merged, entries retained, instruction file updated.

## Output Contract
- List every rule added to the instruction file with its source memory entry.
- List every memory entry removed.
- Output the diff of the instruction file changes.

## Guardrails
- Do not merge tentative or contradicted lessons — leave them in memory for more validation.
- Do not overwrite existing rules in the instruction file — append or extend only.
- Do not embed credentials or personal data in instruction files.

## Source of Truth
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
