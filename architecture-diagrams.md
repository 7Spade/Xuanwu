# Architecture Diagrams

參考來源（SSOT 對齊）：
- `00-logic-overview.md`
- `01-logical-flow.md`
- `02-governance-rules.md`
- `03-infra-mapping.md`

## 1. 結構圖（Structure Diagram）

```mermaid
flowchart LR
  subgraph L0[L0 External Triggers]
    UI[UI / Client Actions]
    WH[Webhook / Scheduler]
  end

  subgraph L0A[L0A CQRS Gateway Ingress]
    CMDGW[CMD_API_GW]
    QRYGW[QRY_API_GW]
  end

  subgraph L2[L2 Command Gateway]
    CBG[CBG_ENTRY -> CBG_AUTH -> CBG_ROUTE]
  end

  subgraph L3[L3 Domain Slices VS1~VS9]
    D1[Identity/Account/Skill/Org]
    D2[Workspace/Scheduling/Notification]
    D3[Semantic/Finance + global-search/portal]
  end

  subgraph L4[L4 IER]
    IER[Integration Event Router]
    LANE[Critical / Standard / Background]
    DLQ[DLQ SAFE_AUTO/REVIEW_REQUIRED/SECURITY_BLOCK]
  end

  subgraph L5[L5 Projection Bus]
    FUNNEL[event-funnel]
    PROJ[Read Models]
  end

  subgraph L6[L6 Query Gateway]
    QGWAY[read-model-registry]
  end

  subgraph L7A[L7-A firebase-client]
    ACLA[Client Adapters via SK_PORTS]
  end

  subgraph L7B[L7-B functions -> firebase-admin]
    ACLB[Backend Admin Adapters]
  end

  L8[(L8 Firebase Runtime)]

  subgraph L9[L9 Observability]
    OBS[trace/metrics/errors]
  end

  subgraph L10[L10 AI Runtime]
    AI[Genkit Flow + Prompt Policy + Tool ACL]
  end

  UI --> CMDGW
  UI --> QRYGW
  WH --> CMDGW

  CMDGW --> CBG --> D1
  CBG --> D2
  CBG --> D3

  D1 --> IER
  D2 --> IER
  D3 --> IER

  IER --> LANE --> FUNNEL --> PROJ
  IER --> DLQ

  QRYGW --> QGWAY --> PROJ

  D1 --> ACLA
  D2 --> ACLA
  D3 --> ACLA
  ACLA --> L8

  CBG --> ACLB
  WH --> ACLB
  ACLB --> L8

  CBG -. traceId .-> OBS
  IER -. relay lag .-> OBS
  FUNNEL -. projection metrics .-> OBS
  AI -. tool audit .-> OBS

  AI --> CBG
  AI --> QGWAY
```

## 2. 時序圖（Sequence Diagram）

```mermaid
sequenceDiagram
  autonumber
  participant U as L0 UI/Client
  participant C0 as L0A CMD_API_GW
  participant Q0 as L0A QRY_API_GW
  participant C2 as L2 CBG_ENTRY/AUTH/ROUTE
  participant D as L3 Domain Slice
  participant E as L4 IER
  participant P as L5 Projection Bus
  participant Q as L6 Query Gateway
  participant A as L7-A firebase-client
  participant B as L7-B functions/admin
  participant F as L8 Firebase Runtime
  participant O as L9 Observability
  participant AI as L10 Genkit

  U->>C0: submit command
  C0->>C2: route write request + traceId
  C2->>D: execute domain command
  D->>A: read/write via SK_PORTS (client-safe path)
  A->>F: firebase client SDK call
  D-->>C2: aggregate updated + domain events
  C2->>E: publish integration events
  E->>P: dispatch by lane (Critical/Standard/Background)
  E->>O: relay lag / failure metrics
  P->>Q: materialize read models
  Q-->>U: queryable projection updated

  U->>Q0: request read model
  Q0->>Q: read route
  Q-->>U: projection response

  AI->>C2: command tool call (governed)
  AI->>Q: query tool call (governed)
  AI->>O: toolCallId/modelId audit

  opt high-privilege or cross-tenant operation
    C2->>B: invoke functions gateway
    B->>F: firebase-admin operation
    B-->>C2: admin result
  end
```
