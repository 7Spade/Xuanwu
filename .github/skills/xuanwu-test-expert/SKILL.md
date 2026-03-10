---
name: xuanwu-test-expert
description: Next.js local preflight and diagnostic skill for Xuanwu. Starts localhost:9002, performs next-devtools project structure and realtime runtime/metadata analysis, and applies minimal automated fixes when safe.
---

# Xuanwu Test Expert

This skill standardizes a full Next.js diagnostic flow: preflight, analyze, auto-fix, and verify.

## When to use

- User asks to run `npm run dev` and open the app in VS Code browser.
- User wants project structure awareness before debugging.
- User requests realtime runtime status or metadata problem analysis.
- User requests automated code generation/fix based on Next.js diagnostics.

## Procedure

1. Start server:
   - Run `npm run dev` as a background process.
2. Discover structure with next-devtools:
   - Run `next-devtools-nextjs_index`.
   - Record server URL, app routes, and diagnostic capabilities.
3. Validate startup and route readiness:
   - Confirm terminal reports successful startup.
4. Open browser:
   - Open `http://localhost:9002` in VS Code integrated browser.
5. Analyze realtime status and metadata:
   - Use `next-devtools-nextjs_call` for runtime/build/route diagnostics.
   - Check metadata behavior including title/canonical/robots/locale tags.
6. Capture evidence:
   - terminal running state
   - page title
   - current URL
   - key diagnostics findings
7. Auto-fix loop (when confident):
   - Generate minimal patch for root cause.
   - Apply only boundary-safe changes.
   - Re-run targeted verification.
8. Report outcome:
   - `PASS` when server and page are ready
   - `PASS_WITH_FIX` when fix applied and verified
   - `BLOCKED` with concise blocker details when not ready

## next-devtools practical features checklist

- Project structure awareness: `next-devtools-nextjs_index`
- Realtime runtime checks: `next-devtools-nextjs_call`
- Metadata analysis: route-level metadata generation and output checks
- Patch-and-verify loop: diagnose -> minimal fix -> browser re-check
- Route-specific troubleshooting without broad refactor

## Guardrails

- Never print `.env.local` secret values.
- Avoid unrelated edits during preflight.
- Keep changes minimal and architecture-compliant.
- Do not claim fix success without revalidation evidence.

## Source

- VS Code prompt files: `docs/copilot/customization/prompt-files.md`
- VS Code custom agents: `docs/copilot/customization/custom-agents.md`
- VS Code agent skills: `docs/copilot/customization/agent-skills.md`
