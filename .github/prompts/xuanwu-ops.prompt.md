---
name: xuanwu-ops
description: 'Handle Xuanwu CI/CD, deployment, operational bootstrap, and environment-aware infrastructure workflows.'
agent: 'xuanwu-ops'
argument-hint: 'Describe the operational task, e.g.: design staged GitHub Actions deploy | bootstrap repomix on a clean machine'
---

# Xuanwu Operations Workflow

This prompt consolidates operational and deployment workflows into one project-specific command.

## Modes

1. **CI/CD orchestration** — secure, staged GitHub Actions and deployment flow.
2. **Environment bootstrap** — machine or tool bootstrap steps required for repository workflows.
3. **Operational troubleshooting** — investigate deployment or runtime-environment issues.

## Guardrails

- Keep operational steps deterministic and reviewable.
- Prefer secure defaults, explicit permissions, and environment-safe configuration.
- Escalate application-code changes to `xuanwu-implementer` unless the task is primarily operational.

Task: ${input:task:Describe the operations task}
