---
name: "Xuanwu Serena Autonomy"
description: "Execution contract for /xuanwu-serena prompt, ensuring context7 + sequentialthinking + Serena-first flow"
applyTo: ".github/{agents,prompts,skills,instructions}/**/*.{md}"
---

# Xuanwu Serena Autonomy Rules

- MUST execute `io.github.upstash/context7` lookup for `oraios/serena` before optimization and implementation.
- MUST execute `sequentialthinking` after context7 lookup to produce an explicit, minimal-risk plan.
- MUST execute Serena initialization path before structural edits:
  - `oraios/serena` `initial_instructions`
  - `oraios/serena` onboarding or memory verification
- SHOULD keep `/xuanwu-serena` prompt concise and delegate behavioral details to custom agent and skill files.
- SHOULD reference, not duplicate, broad project rules already defined in `.github/copilot-instructions.md`.
- MUST provide a validation step (`get_errors` and, when applicable, lint/typecheck commands).
- MUST report changes with concrete file references.\n- SHOULD validate load status in VS Code Chat Diagnostics (agents, prompts, instructions, skills) when behavior is unexpected.
