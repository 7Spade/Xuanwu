---
name: cicd-deployment-orchestrator
description: 'Design CI/CD pipelines for Next.js + Firebase with secure, staged, and verifiable deployment flow.'
agent: 'agent'
---

# CI/CD Deployment Orchestrator

Design or review deployment workflows with production safety.

## Baseline pipeline
`Lint -> Typecheck -> Test -> Build -> Deploy -> Smoke test`

## Required controls
- Branch/environment isolation
- Least-privilege permissions
- Secrets in GitHub/Firebase secret stores only
- Rollback strategy and post-deploy validation

## Output
- Proposed workflow/job structure
- Security and reliability checks
- Deployment + rollback procedure
