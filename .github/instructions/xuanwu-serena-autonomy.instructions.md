---
description: Execution contract for /xuanwu-serena with context7, sequentialthinking, and serena initialization.
applyTo: ".github/{agents,instructions,prompts,skills}/**/*.{md}"
---

# Xuanwu Serena Autonomy Rules

- MUST query `oraios/serena` docs through `io.github.upstash/context7` before implementation.
- MUST run `sequentialthinking` after context7 unless the tool is unavailable; if unavailable, document the failure and continue with explicit fallback planning.
- MUST attempt Serena initialization before structural edits:
  - `oraios/serena` `initial_instructions`
  - onboarding or memory checks
- MUST keep edits focused, deterministic, and UTF-8 (no BOM).
- MUST validate changed files using `get_errors`.
- SHOULD verify customization load using VS Code Chat Diagnostics when behavior is unexpected.
