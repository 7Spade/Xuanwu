---
name: x-arch-auditor
description: 'Architecture compliance audit. Cross-checks against project documentation to detect layer violations, naming drift, and boundary intrusions.'
---

# Architecture Compliance Auditor

## Audit Workflow

1. **Load Truth:** Invoke `tool-repomix` to simultaneously load `docs/architecture/00-LogicOverview.md` and the target code directory.
2. **Run Analysis:** Invoke `tool-thinking` to iterate through each check item:
   - Layer violation: Does UI directly call Infrastructure?
   - Naming drift: Do identifiers deviate from `domain-glossary.md`?
   - Boundary intrusion: Does one BC directly write another BC's Aggregate?
   - Event contract: Are OUTBOX events properly typed in `SK_OUTBOX_CONTRACT`?
3. **Generate Report:** Invoke `tool-planning` to produce an audit report and remediation plan.

## Check Matrix

| Dimension | Standard | Tooling |
|-----------|----------|---------|
| Layer Dependency | Presentation → Application → Domain → Infrastructure | `tool-thinking` |
| File Naming | `src/features/{slice}/_*.ts` for private files | `tool-repomix` |
| Cross-BC Reference | Must be via `@/features/{slice}/index` | `tool-thinking` |
| Aggregate Write | Only `_actions.ts` may write | `tool-thinking` |
| Event Contract | Must declare DLQ tier [D13] | `tool-repomix` |
