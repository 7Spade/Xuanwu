flowchart LR

%% VS0/VS7 architecture - correctness-first model
%% A) Trust boundary and validation are mandatory before any gateway.
%% B) Domain has one side-effect egress only.
%% C) IER decides lanes; consumers cannot bypass lane policy.
%% D) VS7 is notification authority and only consumes STANDARD_LANE.
%% E) Runtime access is modeled by three responsibilities: firebase, firebase-admin, dataconnect-gateway.

subgraph Z0["Ingress Zone"]
  EXT_UI["UI or Server Action Entry"]
  EXT_WEBHOOK["Webhook or External API Entry"]
end

subgraph VS0["VS0 Foundation"]
  direction TB

  subgraph L1["L1 Kernel Contracts"]
    SK_PORTS["SK Contracts\nenvelope, ports, invariants"]
    I_MSG["IMessaging Port\nnotification delivery contract"]
  end

  subgraph L0["L0 Validation Gates"]
    APPCHK_VERIFY["App Check Verify\nattestation gate"]
    WEBHOOK_VERIFY["Webhook Verify\nsignature and timestamp gate"]
    REJECT["Reject 401/403/400"]
  end

  subgraph L2["L2 Command Gateway"]
    WRITE_GW["WRITE_GATEWAY"]
    CMD_PIPE["CBG_ENTRY -> CBG_AUTH -> CBG_ROUTE"]
    WRITE_GW --> CMD_PIPE
  end

  subgraph L6["L6 Query Gateway"]
    READ_GW["READ_GATEWAY"]
    QGWAY["Read Registry and Query Routes"]
    READ_GW --> QGWAY
  end

  L3_DOMAIN["L3 Domain Slices\n(producers only)"]

  subgraph L4["L4 Integration Event Router"]
    UNIFIED_EXIT["UNIFIED_EFFECT_EXIT\nsole domain side-effect egress"]
    RELAY["OUTBOX_RELAY\nscan, deliver, retry, DLQ"]
    IER_CORE["IER_CORE\nclassify by event type and policy"]
    CRIT_LANE["CRITICAL_LANE"]
    STD_LANE["STANDARD_LANE"]
    BG_LANE["BACKGROUND_LANE"]
    DLQ_SAFE["DLQ SAFE_AUTO"]
    DLQ_REVIEW["DLQ REVIEW_REQUIRED"]
    DLQ_SEC["DLQ SECURITY_BLOCK"]

    UNIFIED_EXIT --> RELAY --> IER_CORE
    IER_CORE --> CRIT_LANE
    IER_CORE --> STD_LANE
    IER_CORE --> BG_LANE
    RELAY -. failure tier .-> DLQ_SAFE
    RELAY -. failure tier .-> DLQ_REVIEW
    RELAY -. failure tier .-> DLQ_SEC
  end

  subgraph L5["L5 Projection Bus"]
    PROJ_BUS["Projection Funnel and Read Models"]
  end

  subgraph L7["L7 SDK Modules (src/shared-infra/*)"]
    AC_GATE["Anti-Corruption Rules\nno direct firebase import outside adapters"]

    subgraph FE_STACK["Frontend SDK Path"]
      FE_ROOT["src/shared-infra/frontend-firebase"]
      FE_SDK["firebase SDK adapters\nclient auth/firestore/rtdb/messaging/storage/analytics/app-check"]
      FE_ROOT -. module ownership .-> FE_SDK
    end

    subgraph BE_STACK["Backend SDK Path"]
      BE_ROOT["src/shared-infra/backend-firebase"]
      BE_FN["src/shared-infra/backend-firebase/functions"]
      ADMIN_SDK["firebase-admin adapters\nadmin auth/firestore/messaging/storage/app-check"]
      BE_DC["src/shared-infra/backend-firebase/dataconnect"]

      BE_ROOT -. module ownership .-> BE_FN
      BE_FN -. module ownership .-> ADMIN_SDK
      BE_ROOT -. module ownership .-> BE_DC
    end

    AC_GATE --> FE_SDK
    AC_GATE --> BE_FN
    AC_GATE --> ADMIN_SDK
    AC_GATE --> BE_DC
  end

  subgraph L9["L9 Observability"]
    OBS["trace, metrics, domain errors"]
  end

  subgraph L10["L10 AI Control Plane"]
    AI_GW["AI Flow Gateway, Prompt Policy, Tool ACL"]
  end
end

subgraph VS7["VS7 Notification Hub"]
  NOTIF_ROUTER["notification-router\nconsume STANDARD_LANE only"]
  CHANNEL_POLICY["channel-policy resolver\nroute by event semantics"]
  NOTIF_EXIT["notification side-effect exit\nsole delivery authority"]
  USER_NOTIF["user-notification-view\nseen and unseen projection"]
  DEVICE_PROFILE["user-device-profile\nFCM token profile"]

  NOTIF_ROUTER --> CHANNEL_POLICY --> NOTIF_EXIT --> USER_NOTIF
  DEVICE_PROFILE -. read token .-> NOTIF_EXIT
end

subgraph L8["L8 External Firebase Runtime Services"]
  F_AUTH[(Auth)]
  F_DB[(Firestore)]
  F_RTDB[(RTDB)]
  F_FCM[(Firebase Cloud Messaging)]
  F_STORE[(Storage)]
  F_ANALYTICS[(Analytics)]
  F_APPCHECK[(App Check)]
  F_FUNCTIONS[(Cloud Functions)]
  F_DATACONNECT[(Data Connect)]
end

%% Inbound validation
EXT_UI --> APPCHK_VERIFY
APPCHK_VERIFY -. invalid .-> REJECT
EXT_WEBHOOK --> WEBHOOK_VERIFY
WEBHOOK_VERIFY -. invalid .-> REJECT

%% Command and query entry
APPCHK_VERIFY --> WRITE_GW
WEBHOOK_VERIFY --> WRITE_GW
APPCHK_VERIFY --> READ_GW

%% Command chain (producer-only to single egress)
CMD_PIPE --> L3_DOMAIN --> UNIFIED_EXIT

%% Lane consumers
CRIT_LANE --> PROJ_BUS
STD_LANE --> PROJ_BUS
BG_LANE --> PROJ_BUS
STD_LANE -->|notification events| NOTIF_ROUTER

%% Query chain
PROJ_BUS --> QGWAY

%% Contract discipline
CMD_PIPE -. uses contracts .-> SK_PORTS
QGWAY -. uses contracts .-> SK_PORTS
PROJ_BUS -. uses contracts .-> SK_PORTS
NOTIF_ROUTER -. uses envelope contract .-> SK_PORTS
NOTIF_EXIT -. uses port .-> I_MSG
I_MSG -. contract in .-> SK_PORTS
SK_PORTS --> AC_GATE

%% L7 SDK to L8 runtime mappings
FE_SDK --> F_AUTH
FE_SDK --> F_DB
FE_SDK --> F_RTDB
FE_SDK --> F_FCM
FE_SDK --> F_STORE
FE_SDK --> F_ANALYTICS
FE_SDK --> F_APPCHECK

BE_FN --> F_FUNCTIONS
ADMIN_SDK --> F_AUTH
ADMIN_SDK --> F_DB
ADMIN_SDK --> F_FCM
ADMIN_SDK --> F_STORE
ADMIN_SDK --> F_APPCHECK

BE_DC --> F_DATACONNECT

%% App Check lifecycle
FE_SDK -. token init and refresh .-> APPCHK_VERIFY

%% VS7 runtime egress via SDK boundary
I_MSG -. implemented by .-> FE_SDK
I_MSG -. implemented by .-> ADMIN_SDK
NOTIF_EXIT -. runtime dispatch via I_MSG only .-> I_MSG

%% Cross-cutting observability
CMD_PIPE --> OBS
RELAY --> OBS
IER_CORE --> OBS
PROJ_BUS --> OBS
QGWAY --> OBS
NOTIF_EXIT --> OBS

%% AI control boundaries
AI_GW -. tools must pass L1 and L7 boundaries .-> SK_PORTS
AI_GW --> WRITE_GW
AI_GW --> READ_GW

%% Forbidden paths (governance invariants)
L3_DOMAIN -. forbidden direct sdk call .-x F_DB
L3_DOMAIN -. forbidden direct sdk call .-x F_AUTH
L3_DOMAIN -. forbidden direct sdk call .-x F_RTDB
L3_DOMAIN -. forbidden direct sdk call .-x F_FCM
L3_DOMAIN -. forbidden direct sdk call .-x F_STORE
L3_DOMAIN -. forbidden direct sdk call .-x F_ANALYTICS
L3_DOMAIN -. forbidden direct sdk call .-x F_APPCHECK
L3_DOMAIN -. forbidden direct sdk call .-x F_FUNCTIONS
L3_DOMAIN -. forbidden direct sdk call .-x F_DATACONNECT
L3_DOMAIN -. forbidden direct sdk call .-x FE_SDK
L3_DOMAIN -. forbidden direct sdk call .-x ADMIN_SDK
L3_DOMAIN -. forbidden direct notify call .-x NOTIF_EXIT
NOTIF_EXIT -. forbidden direct adapter dependency .-x FE_SDK
NOTIF_EXIT -. forbidden direct adapter dependency .-x ADMIN_SDK
VS7 -. forbidden own Firebase runtime resource .-x F_FCM
UNIFIED_EXIT -. forbidden bypass IER .-x NOTIF_ROUTER
QGWAY -. forbidden reverse drive .-x WRITE_GW

