flowchart LR

%% VS0/VS7 architecture - correctness-first model
%% A) Trust boundary and validation are mandatory before any gateway.
%% B) Domain has one side-effect egress only.
%% C) IER decides lanes; consumers cannot bypass lane policy.
%% D) VS7 is notification authority and only consumes STANDARD_LANE.
%% E) Runtime access is modeled by three responsibilities: firebase, firebase-admin, dataconnect-gateway.
%% F) Anti-corruption is translator-first: VS0 standardized SDK ports are the only runtime contract.
%% G) API Gateway enforces command/query split before entering write/read gateways.

subgraph Z0["Ingress Zone"]
  EXT_UI["UI or Server Action Entry"]
  EXT_WEBHOOK["Webhook or External API Entry"]
end

subgraph VS0["VS0 Foundation"]
  direction TB

  subgraph L1["L1 Kernel Contracts"]
    SK_PORTS["SK Contracts\nenvelope, ports, invariants"]
    I_MSG["IMessaging Port\nnotification delivery contract"]
    I_DC["IDataConnect Port\ngoverned GraphQL and connector contract"]
    I_STD_AUTH["IStdAuth Port\nstandardized auth contract"]
    I_STD_DATA["IStdData Port\nstandardized data contract"]
    I_STD_STORAGE["IStdStorage Port\nstandardized storage contract"]
    I_STD_ANALYTICS["IStdAnalytics Port\nstandardized analytics contract"]
    I_STD_APPCHECK["IStdAppCheck Port\nstandardized attestation contract"]
  end

  subgraph L0["L0 Validation Gates"]
    APPCHK_VERIFY["App Check Verify\nattestation gate"]
    WEBHOOK_VERIFY["Webhook Verify\nsignature and timestamp gate"]
    AI_REQ_VERIFY["AI Request Verify\npolicy, authn, tool-ACL gate"]
    REJECT["Reject 401/403/400"]
  end

  subgraph L0A["L0A API Gateway Split"]
    CMD_API_GW["COMMAND_API_GATEWAY\nwrite-only ingress"]
    QRY_API_GW["QUERY_API_GATEWAY\nread-only ingress"]
  end

  subgraph L2["L2 Command Gateway (Write Side)"]
    WRITE_GW["WRITE_GATEWAY"]
    CMD_PIPE["CBG_ENTRY -> CBG_AUTH -> CBG_ROUTE"]
    WRITE_GW --> CMD_PIPE
  end

  subgraph L6["L6 Query Gateway (Read Side)"]
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
    AC_TRANSLATOR["Anti-Corruption Translator\nSDK semantics -> VS0 standardized ports"]
    I_MSG_ADAPTER_SELECTOR["I_MSG Adapter Selector\nprimary admin, fallback frontend"]
    L7_NOTE["L7-only port implementation detail\nnot VS7 authority"]

    subgraph CLIENT_ADAPTERS["Client Functional Adapters"]
      FE_AUTH_ADAPTER["client-auth-adapter"]
      FE_DATA_ADAPTER["client-data-adapter\nfirestore and rtdb"]
      FE_MSG_ADAPTER["client-messaging-adapter"]
      FE_STORAGE_ADAPTER["client-storage-adapter"]
      FE_ANALYTICS_ADAPTER["client-analytics-adapter"]
      FE_APPCHECK_ADAPTER["client-appcheck-adapter"]
    end

    subgraph ADMIN_ADAPTERS["Admin Functional Adapters"]
      BE_FN_ADAPTER["functions-adapter"]
      ADMIN_AUTH_ADAPTER["admin-auth-adapter"]
      ADMIN_DATA_ADAPTER["admin-data-adapter\nfirestore"]
      ADMIN_MSG_ADAPTER["admin-messaging-adapter"]
      ADMIN_STORAGE_ADAPTER["admin-storage-adapter"]
      ADMIN_APPCHECK_ADAPTER["admin-appcheck-adapter"]
      BE_DC_ADAPTER["dataconnect-gateway-adapter"]
    end

    AC_TRANSLATOR --> FE_AUTH_ADAPTER
    AC_TRANSLATOR --> FE_DATA_ADAPTER
    AC_TRANSLATOR --> FE_STORAGE_ADAPTER
    AC_TRANSLATOR --> FE_ANALYTICS_ADAPTER
    AC_TRANSLATOR --> FE_APPCHECK_ADAPTER
    AC_TRANSLATOR --> ADMIN_AUTH_ADAPTER
    AC_TRANSLATOR --> ADMIN_DATA_ADAPTER
    AC_TRANSLATOR --> ADMIN_STORAGE_ADAPTER
    AC_TRANSLATOR --> ADMIN_APPCHECK_ADAPTER
    AC_TRANSLATOR --> BE_DC_ADAPTER
    I_MSG_ADAPTER_SELECTOR --> ADMIN_MSG_ADAPTER
    I_MSG_ADAPTER_SELECTOR -. fallback .-> FE_MSG_ADAPTER
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
  F_RUNTIME_ANY[(Any Firebase Runtime Resource)]
end

%% Inbound validation
EXT_UI --> APPCHK_VERIFY
APPCHK_VERIFY -. invalid .-> REJECT
EXT_WEBHOOK --> WEBHOOK_VERIFY
WEBHOOK_VERIFY -. invalid .-> REJECT

%% Command and query entry
APPCHK_VERIFY --> CMD_API_GW
WEBHOOK_VERIFY --> CMD_API_GW
WEBHOOK_VERIFY -. read not allowed .-> REJECT
APPCHK_VERIFY --> QRY_API_GW
CMD_API_GW --> WRITE_GW
QRY_API_GW --> READ_GW

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
I_DC -. contract in .-> SK_PORTS
I_STD_AUTH -. contract in .-> SK_PORTS
I_STD_DATA -. contract in .-> SK_PORTS
I_STD_STORAGE -. contract in .-> SK_PORTS
I_STD_ANALYTICS -. contract in .-> SK_PORTS
I_STD_APPCHECK -. contract in .-> SK_PORTS
SK_PORTS --> AC_TRANSLATOR

%% L7 SDK to L8 runtime mappings
FE_AUTH_ADAPTER --> F_AUTH
FE_DATA_ADAPTER --> F_DB
FE_DATA_ADAPTER --> F_RTDB
FE_MSG_ADAPTER --> F_FCM
FE_STORAGE_ADAPTER --> F_STORE
FE_ANALYTICS_ADAPTER --> F_ANALYTICS
FE_APPCHECK_ADAPTER --> F_APPCHECK

BE_FN_ADAPTER --> F_FUNCTIONS
ADMIN_AUTH_ADAPTER --> F_AUTH
ADMIN_DATA_ADAPTER --> F_DB
ADMIN_MSG_ADAPTER --> F_FCM
ADMIN_STORAGE_ADAPTER --> F_STORE
ADMIN_APPCHECK_ADAPTER --> F_APPCHECK

BE_DC_ADAPTER --> F_DATACONNECT
BE_DC_ADAPTER -. implements .-> I_DC

AC_TRANSLATOR -. exposes .-> I_STD_AUTH
AC_TRANSLATOR -. exposes .-> I_STD_DATA
AC_TRANSLATOR -. exposes .-> I_STD_STORAGE
AC_TRANSLATOR -. exposes .-> I_STD_ANALYTICS
AC_TRANSLATOR -. exposes .-> I_STD_APPCHECK

%% App Check lifecycle
FE_APPCHECK_ADAPTER -. token init and refresh .-> APPCHK_VERIFY

%% VS7 runtime egress via SDK boundary
I_MSG -. implemented by .-> I_MSG_ADAPTER_SELECTOR
I_MSG_ADAPTER_SELECTOR -. ownership .-> L7_NOTE
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
AI_GW --> AI_REQ_VERIFY
AI_REQ_VERIFY -. invalid .-> REJECT
AI_REQ_VERIFY --> CMD_API_GW
AI_REQ_VERIFY --> QRY_API_GW

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
L3_DOMAIN -. forbidden direct adapter call .-x FE_AUTH_ADAPTER
L3_DOMAIN -. forbidden direct adapter call .-x FE_DATA_ADAPTER
L3_DOMAIN -. forbidden direct adapter call .-x ADMIN_DATA_ADAPTER
L3_DOMAIN -. forbidden direct adapter call .-x ADMIN_MSG_ADAPTER
L3_DOMAIN -. forbidden direct notify call .-x NOTIF_EXIT
NOTIF_EXIT -. forbidden direct adapter dependency .-x FE_MSG_ADAPTER
NOTIF_EXIT -. forbidden direct adapter dependency .-x ADMIN_MSG_ADAPTER
VS7 -. forbidden own Firebase runtime resource .-x F_RUNTIME_ANY
VS7 -. forbidden adapter dependency .-x AC_TRANSLATOR
VS7 -. forbidden adapter dependency .-x FE_MSG_ADAPTER
VS7 -. forbidden adapter dependency .-x ADMIN_MSG_ADAPTER
UNIFIED_EXIT -. forbidden bypass IER .-x NOTIF_ROUTER
QGWAY -. forbidden reverse drive .-x WRITE_GW

