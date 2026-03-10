# Persistence Model Overview

This document is a stable summary of how persistence responsibilities are organized in Xuanwu.

## Canonical References

For authoritative details, use:

- `docs/architecture/00-logic-overview.md`
- `docs/architecture/03-infra-mapping.md`
- `.memory/knowledge-graph.json`

## Persistence Responsibilities

### Write path

The canonical write chain is:

`External/L0 → L0A Command API Gateway → L2 Command Gateway → L3 Domain Slices → L4 IER → L5 Projection`

### Read path

The canonical read chain is:

`UI/L0 → L0A Query API Gateway → L6 Query Gateway → L5 Projection`

### Runtime boundary

- Pure contracts live in `src/shared-kernel/`
- Firebase boundary adapters live in `src/shared-infra/frontend-firebase/` and `src/shared-infra/backend-firebase/`
- Query orchestration lives in `src/shared-infra/gateway-query/`
- Projection materialization lives in `src/shared-infra/projection-bus/`

## Review Rules

- Do not place persistence side effects in `src/shared-kernel/`.
- Do not bypass L7 boundary adapters when accessing Firebase runtime concerns.
- Keep read and write responsibilities separated according to the canonical chains above.
