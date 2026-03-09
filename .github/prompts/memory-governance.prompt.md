---
name: memory-governance
description: 'Govern project memory graph so architecture decisions and conventions stay consistent across sessions.'
agent: 'agent'
tools: ['memory']
---

# Memory Knowledge Graph Governance

Use memory operations to keep reusable project facts accurate.

## Rules
1. Read relevant memory before major implementation/audit work.
2. Store stable, reusable facts after meaningful decisions.
3. Prefer architecture invariants, conventions, and verified commands.
4. Do not store secrets or volatile details.

## Output
- What was read
- What was added/updated
- Why each memory item is useful
